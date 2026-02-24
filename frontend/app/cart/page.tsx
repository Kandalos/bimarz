"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
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
}

interface CartData {
  items: CartItem[];
  subtotal: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.get('/orders/cart/');
      const data: CartData = res.data;
      setCartItems(data.items);
      setSubtotal(data.subtotal);
    } catch (err: any) {
      console.error(err);
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

  const updateQuantity = async (cartItemId: number, bookId: number, change: number) => {
    const item = cartItems.find((i) => i.id === cartItemId);
    if (!item) return;
    const newQuantity = Math.max(1, item.quantity + change);
    try {
      await apiService.post('/orders/cart/add/', {
        book_id: bookId,
        quantity: newQuantity,
      });
      fetchCart(); // refresh
    } catch (err) {
      alert("خطا در به‌روزرسانی تعداد");
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await apiService.delete(`/orders/cart/remove/${cartItemId}/`);
      fetchCart();
    } catch (err) {
      alert("خطا در حذف آیتم");
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString("fa-IR");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p>در حال بارگذاری...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center text-red-500">
          <p>{error}</p>
          <Button onClick={() => router.push('/login')} className="mt-4">
            ورود
          </Button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-8">سبد خرید</h1>

          {cartItems.length === 0 ? (
            <Card className="border-2 border-wood-light/40 wood-texture text-center py-12">
              <CardContent>
                <p className="text-xl text-muted-foreground mb-6">سبد خرید شما خالی است</p>
                <Link href="/shop">
                  <Button className="bg-wood-medium hover:bg-wood-dark text-white">
                    بازگشت به فروشگاه
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="border-2 border-wood-light/40 wood-texture">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={item.cover_image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-24 h-32 object-cover rounded border-2 border-wood-light/40"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-wood-dark mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{item.author}</p>
                          <p className="text-xl font-bold text-wood-medium mb-3">
                            {formatPrice(item.price)} یورو
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.book_id, -1)}
                                className="border-wood-medium text-wood-dark"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-bold text-wood-dark">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.book_id, 1)}
                                className="border-wood-medium text-wood-dark"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeItem(item.id)}
                              className="mr-auto"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="border-2 border-wood-light/40 wood-texture sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-wood-dark">خلاصه سفارش</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>جمع کل:</span>
                      <span>{formatPrice(subtotal)} یورو</span>
                    </div>
                    <div className="border-t border-wood-light/40 pt-4">
                      <div className="flex justify-between text-xl font-bold text-wood-dark">
                        <span>مجموع:</span>
                        <span>{formatPrice(subtotal)} یورو</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                    >
                      ادامه فرایند خرید
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                    <Link href="/shop">
                      <Button
                        variant="outline"
                        className="w-full border-wood-medium text-wood-dark bg-transparent"
                      >
                        ادامه خرید
                      </Button>
                    </Link>
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