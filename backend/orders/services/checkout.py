from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from orders.models import Order, OrderItem, Cart, ShippingZone, PromoCode


def validate_shipping_profile(user, return_missing=False):
    """
    Check that user has all required shipping fields.
    If return_missing=True, return list of missing field names (Persian).
    Otherwise raise ValidationError.
    """
    missing = []

    if not user.address:
        missing.append("آدرس")
    if not user.postal_code:
        missing.append("کد پستی")
    if not user.phone_number:
        missing.append("شماره تلفن")
    if not user.location:          # location is a ForeignKey to Location model
        missing.append("کشور/شهر")

    if return_missing:
        return missing

    if missing:
        raise ValidationError("اطلاعات پروفایل ناقص است: " + ", ".join(missing))
    return True

def calculate_shipping(user):
    if not user.location:
        raise ValidationError("محل سکونت شما ثبت نشده است.")
    # Find a shipping zone that includes this location
    zone = ShippingZone.objects.filter(locations=user.location).first()
    if not zone:
        raise ValidationError("هزینه ارسال برای محل شما تعریف نشده است.")
    return zone.price_eur

 
@transaction.atomic
def convert_cart_to_order(cart, promo_code=None):
    """
    Convert a user's cart into an Order.
    Returns the created Order object.
    """
    user = cart.user
    # Validate shipping profile (raises ValidationError if incomplete)
    validate_shipping_profile(user)

    # Calculate shipping fee
    shipping_fee = calculate_shipping(user)

    # Calculate subtotal from cart items
    subtotal = sum(item.total_price for item in cart.items.select_related('book'))

    # Create order (without discount/total yet)
    order = Order(
        user=user,
        promo_code=promo_code,
        shipping_address=user.address,
        shipping_city=user.city,  # adjust if you have separate fields
        shipping_postal_code=user.postal_code,  # adjust
        shipping_country=user.location.country,  # assuming location has country
        shipping_phone=user.phone_number,
        subtotal=subtotal,
        shipping_fee=shipping_fee,
    )
    # Apply discount and set total
    order.apply_discount()
    order.save()

    # Create order items from cart items
    for cart_item in cart.items.select_related('book'):
        OrderItem.objects.create(
            order=order,
            book=cart_item.book,
            title=cart_item.book.title,
            isbn=getattr(cart_item.book, 'isbn', ''),
            price=cart_item.book.price,
            quantity=cart_item.quantity,
        )

    # Optionally, we don't delete the cart yet; it will be cleared after payment confirmation.
    # The cart remains until payment is captured.
    return order