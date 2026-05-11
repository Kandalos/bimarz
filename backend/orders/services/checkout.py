from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from orders.models import Order, OrderItem, Cart, ShippingZone, ShippingConfig, PromoCode


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
    if not user.location:
        missing.append("کشور/شهر")

    if return_missing:
        return missing

    if missing:
        raise ValidationError("اطلاعات پروفایل ناقص است: " + ", ".join(missing))
    return True


def calculate_book_weight(book, paper_weight_grams):
    """
    Calculate a single book's weight.

    Formula: number_of_pages × paper_weight_grams

    Args:
        book: Book model instance (must have a `pages` field).
        paper_weight_grams (Decimal): weight per page in grams.

    Returns:
        Decimal: book weight in grams. Returns 0 if pages is missing/invalid.
    """
    try:
        pages = Decimal(str(book.pages)) if book.pages else Decimal("0")
    except Exception:
        pages = Decimal("0")
    return pages * Decimal(str(paper_weight_grams))


def calculate_shipment_weight(cart_items, paper_weight_grams):
    """
    Calculate the total shipment weight for all books in the cart.

    Each CartItem contributes: book_weight × quantity

    Args:
        cart_items: QuerySet/iterable of CartItem instances (must be prefetched with 'book').
        paper_weight_grams (Decimal): weight per page in grams (from ShippingConfig).

    Returns:
        Decimal: total shipment weight in grams.
    """
    total = Decimal("0")
    for item in cart_items:
        book_weight = calculate_book_weight(item.book, paper_weight_grams)
        total += book_weight * Decimal(str(item.quantity))
    return total


def calculate_shipping(user, cart=None):
    """
    Determine shipping cost for a user based on their location and cart contents.

    Steps:
      1. Resolve the ShippingZone for the user's location.
      2. Load the global ShippingConfig to get the configured paper weight.
      3. Sum the weight of all books in the cart (pages × paper_weight × quantity).
      4. Apply zone pricing logic:
         - weight ≤ zone.weight_threshold  →  zone.default_price
         - weight >  zone.weight_threshold  →  total_weight × zone.price_per_weight_unit

    Args:
        user: CustomUser instance (must have a `location` FK).
        cart (Cart, optional): if None, fetched from DB automatically.

    Returns:
        Decimal: shipping cost in EUR.

    Raises:
        ValidationError: if user has no location or no matching shipping zone.
    """
    if not user.location:
        raise ValidationError("محل سکونت شما ثبت نشده است.")

    zone = ShippingZone.objects.filter(locations=user.location, active=True).first()
    if not zone:
        raise ValidationError("هزینه ارسال برای محل شما تعریف نشده است.")

    # Fetch cart if not passed
    if cart is None:
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            # Empty cart → return fixed default price
            return zone.default_price

    cart_items = cart.items.select_related("book").all()

    # Global paper weight configuration
    config = ShippingConfig.get_solo()
    paper_weight_grams = config.paper_weight_grams

    # Compute total shipment weight
    total_weight = calculate_shipment_weight(cart_items, paper_weight_grams)

    # Delegate pricing logic to the zone
    return zone.calculate_shipping_cost(total_weight)


@transaction.atomic
def convert_cart_to_order(cart, promo_code=None):
    """
    Convert a user's cart into an Order.
    Returns the created Order object.
    """
    user = cart.user
    validate_shipping_profile(user)

    shipping_fee = calculate_shipping(user, cart=cart)
    subtotal = sum(
        item.book.price * item.quantity
        for item in cart.items.select_related("book")
    )

    discount_amount = Decimal("0")
    if promo_code:
        if promo_code.discount_type == PromoCode.PERCENT:
            discount_amount = (subtotal * promo_code.value / Decimal("100")).quantize(Decimal("0.01"))
        elif promo_code.discount_type == PromoCode.FIXED:
            discount_amount = min(promo_code.value, subtotal)

    total_amount = subtotal + shipping_fee - discount_amount

    order = Order.objects.create(
        user=user,
        order_number=_generate_order_number(),
        subtotal=subtotal,
        shipping_fee=shipping_fee,
        discount_amount=discount_amount,
        total_amount=total_amount,
        email_snapshot=user.email,
        phone_snapshot=user.phone_number or "",
        address_snapshot=user.address or "",
        postal_code_snapshot=user.postal_code or "",
        location_snapshot=str(user.location) if user.location else "",
    )

    for cart_item in cart.items.select_related("book"):
        OrderItem.objects.create(
            order=order,
            book_id=cart_item.book.id,
            title_snapshot=cart_item.book.title,
            price_snapshot=cart_item.book.price,
            quantity=cart_item.quantity,
        )

    return order


def _generate_order_number():
    import random
    import string
    from django.utils import timezone
    ts = timezone.now().strftime("%Y%m%d")
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{ts}-{suffix}"