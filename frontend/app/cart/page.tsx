"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      title: "باد مرگ",
      author: "سروش مظفر مقدم",
      price: 120000,
      quantity: 2,
      image: "/elegant-book-cover-with-observatory-theme-minimali.jpg",
    },
    {
      id: 2,
      title: "به از نفس اقتادگان",
      author: "مریم نوری",
      price: 150000,
      quantity: 1,
      image: "/sophisticated-book-cover-with-geometric-lines-mode.jpg",
    },
  ])

  const updateQuantity = (id: number, change: number) => {
    setCartItems(
      cartItems.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item)),
    )
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 30000
  const total = subtotal + shipping

  const handleCheckout = () => {
    // Redirect to payment gateway
    window.location.href = "https://payment.example.com"
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
                  <Button className="bg-wood-medium hover:bg-wood-dark text-white">بازگشت به فروشگاه</Button>
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
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-24 h-32 object-cover rounded border-2 border-wood-light/40"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-wood-dark mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{item.author}</p>
                          <p className="text-xl font-bold text-wood-medium mb-3">
                            {item.price.toLocaleString("fa-IR")} یورو
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="border-wood-medium text-wood-dark"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-bold text-wood-dark">{item.quantity}</span>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, 1)}
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
                      <span>{subtotal.toLocaleString("fa-IR")} یورو</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>هزینه ارسال:</span>
                      <span>{shipping.toLocaleString("fa-IR")} یورو</span>
                    </div>
                    <div className="border-t border-wood-light/40 pt-4">
                      <div className="flex justify-between text-xl font-bold text-wood-dark">
                        <span>مجموع:</span>
                        <span>{total.toLocaleString("fa-IR")} یورو</span>
                      </div>
                    </div>
                    <Button onClick={handleCheckout} className="w-full bg-wood-medium hover:bg-wood-dark text-white">
                      پرداخت
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                    <Link href="/shop">
                      <Button variant="outline" className="w-full border-wood-medium text-wood-dark bg-transparent">
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
  )
}
