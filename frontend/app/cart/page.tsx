"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiService from "@/lib/apiService";

interface CartItem {
  id: number;
  book_id: number;
  title: string;
  author: string;
  price: number;
  cover_image: string | null;
  quantity: number;
  // Backend also returns stock via book serializer – include if available
  stock?: number;
}

interface CartData {
  items: CartItem[];
  subtotal: number;
  shipping_fee?: number;
  total?: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Per-item inline error messages (stock violations etc.)
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});
  const [updatingItems, setUpdatingItems] = useState<Record<number, boolean>>({});
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get('/orders/cart/');
      const data: CartData = res.data;
      setCartItems(data.items);
      setSubtotal(data.subtotal);
      if (data.shipping_fee != null) setShippingFee(data.shipping_fee);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("لطفاً ابتدا وارد شوید");
      } else {
        setError("خطا در دریافت سبد خرید");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const setItemError = (itemId: number, msg: string) => {
    setItemErrors(prev => ({ ...prev, [itemId]: msg }));
  };
  const clearItemError = (itemId: number) => {
    setItemErrors(prev => { const n = { ...prev }; delete n[itemId]; return n; });
  };

  const updateQuantity = async (cartItemId: number, bookId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const item = cartItems.find(i => i.id === cartItemId);

    // Frontend stock guard: if we know the stock, enforce it locally first
    if (item?.stock != null && newQuantity > item.stock) {
      setItemError(cartItemId, `فقط ${item.stock} جلد موجود است`);
      return;
    }

    clearItemError(cartItemId);
    setUpdatingItems(prev => ({ ...prev, [cartItemId]: true }));

    try {
      await apiService.post('/orders/cart/add/', { book_id: bookId, quantity: newQuantity });
      // Optimistic local update
      setCartItems(prev =>
        prev.map(i => i.id === cartItemId ? { ...i, quantity: newQuantity } : i)
      );
      // Recalculate subtotal locally
      setSubtotal(
        cartItems.reduce((sum, i) =>
          sum + (i.id === cartItemId ? newQuantity : i.quantity) * i.price, 0
        )
      );
    } catch (err: any) {
      // Show server error (e.g. stock exceeded)
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "خطا در به‌روزرسانی تعداد";
      setItemError(cartItemId, msg);

      // If server returned available_stock, cap the local quantity
      const serverStock = err?.response?.data?.available_stock;
      if (serverStock != null) {
        setCartItems(prev =>
          prev.map(i => i.id === cartItemId ? { ...i, stock: serverStock } : i)
        );
      }
    } finally {
      setUpdatingItems(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await apiService.delete(`/orders/cart/remove/${cartItemId}/`);
      setCartItems(prev => prev.filter(i => i.id !== cartItemId));
      clearItemError(cartItemId);
    } catch {
      setItemError(cartItemId, "خطا در حذف آیتم");
    }
  };

  // ── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wood-medium" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-red-600">{error}</p>
        {error.includes("وارد") && (
          <Button onClick={() => router.push("/login?redirect=/cart")} className="bg-wood-dark text-white">
            ورود به حساب
          </Button>
        )}
      </main>
    );
  }

  const total = shippingFee != null ? subtotal + shippingFee : subtotal;

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-wood-dark mb-8">سبد خرید</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-muted-foreground text-lg">سبد خرید شما خالی است</p>
              <Link href="/shop">
                <Button className="bg-wood-dark text-white">رفتن به فروشگاه</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => (
                  <Card key={item.id} className="border-2 border-wood-light/40">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-4">
                        {/* Cover */}
                        <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-wood-light/20">
                          {item.cover_image ? (
                            <img
                              src={item.cover_image.startsWith("http")
                                ? item.cover_image
                                : `${process.env.NEXT_PUBLIC_API_BASE_URL}${item.cover_image}`}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-wood-medium text-xs text-center px-1">
                              {item.title}
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-wood-dark truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.author}</p>
                          <p className="text-wood-dark font-medium mt-1">
                            {Number(item.price).toLocaleString("fa-IR")} تومان
                          </p>

                          {/* Quantity controls */}
                                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Button
                              size="icon-sm"
                              variant="outline"
                              disabled={updatingItems[item.id] || item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.book_id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-bold">
                              {updatingItems[item.id]
                                ? <Loader2 className="w-4 h-4 animate-spin inline" />
                                : item.quantity}
                            </span>
                            <Button
                              size="icon-sm"
                              variant="outline"
                              disabled={
                                updatingItems[item.id] ||
                                (item.stock != null && item.quantity >= item.stock)
                              }
                              onClick={() => updateQuantity(item.id, item.book_id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            {item.stock != null && item.quantity >= item.stock && (
                              <span className="text-xs text-amber-600">حداکثر موجودی</span>
                            )}

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeItem(item.id)}
                              className="mr-auto"
                              disabled={updatingItems[item.id]}
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </Button>
                          </div>

                          {/* Per-item error */}
                          {itemErrors[item.id] && (
                            <div className="flex items-center gap-1.5 text-red-600 text-xs mt-1.5 bg-red-50 border border-red-200 rounded px-2 py-1">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              {itemErrors[item.id]}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order summary */}
                <div className="lg:col-span-1">
                  <Card className="border-2 border-wood-light/40 sticky top-24">
                    <CardContent className="pt-6 space-y-4">
                      <h2 className="font-bold text-wood-dark text-lg">خلاصه سفارش</h2>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>جمع کالاها</span>
                          <span>{Number(subtotal).toLocaleString("fa-IR")} تومان</span>
                        </div>
                        {shippingFee != null && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>هزینه ارسال</span>
                            <span>€{Number(shippingFee).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-wood-dark border-t pt-2">
                          <span>مجموع</span>
                          <span>{Number(subtotal).toLocaleString("fa-IR")} تومان</span>
                        </div>
                      </div>

                      {/* Fixed button spacing */}
                      <div className="flex flex-col gap-4">
                        <Link href="/checkout">
                          <Button className="w-full bg-wood-dark hover:bg-wood-medium text-white">
                            ادامه خرید
                            <ArrowLeft className="w-4 h-4 mr-2" />
                          </Button>
                        </Link>
                        <Link href="/shop">
                          <Button variant="outline" className="w-full border-wood-medium text-wood-dark">
                            ادامه خرید از فروشگاه
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}