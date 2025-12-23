"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Package, User, Calendar, DollarSign } from "lucide-react"

type Purchase = {
  id: number
  orderId: string
  customerName: string
  customerEmail: string
  items: { title: string; quantity: number; price: number }[]
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  orderDate: string
  shippingAddress: string
}

export default function AdminPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([
    {
      id: 1,
      orderId: "ORD-001",
      customerName: "علی محمدی",
      customerEmail: "ali@example.com",
      items: [
        { title: "سفر به ستارگان", quantity: 1, price: 250000 },
        { title: "راز باغ", quantity: 2, price: 180000 },
      ],
      totalAmount: 610000,
      status: "processing",
      orderDate: "۱۴۰۳/۰۱/۱۵",
      shippingAddress: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
    },
    {
      id: 2,
      orderId: "ORD-002",
      customerName: "سارا احمدی",
      customerEmail: "sara@example.com",
      items: [{ title: "داستان شهر", quantity: 1, price: 320000 }],
      totalAmount: 320000,
      status: "shipped",
      orderDate: "۱۴۰۳/۰۱/۱۴",
      shippingAddress: "اصفهان، خیابان چهارباغ، پلاک ۴۵",
    },
    {
      id: 3,
      orderId: "ORD-003",
      customerName: "محمد رضایی",
      customerEmail: "mohammad@example.com",
      items: [{ title: "شعرهای نو", quantity: 3, price: 150000 }],
      totalAmount: 450000,
      status: "pending",
      orderDate: "۱۴۰۳/۰۱/۱۶",
      shippingAddress: "شیراز، خیابان زند، پلاک ۷۸",
    },
  ])

  const handleStatusChange = (id: number, newStatus: Purchase["status"]) => {
    setPurchases(purchases.map((purchase) => (purchase.id === id ? { ...purchase, status: newStatus } : purchase)))
  }

  const getStatusColor = (status: Purchase["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "processing":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: Purchase["status"]) => {
    switch (status) {
      case "pending":
        return "در انتظار"
      case "processing":
        return "در حال پردازش"
      case "shipped":
        return "ارسال شده"
      case "delivered":
        return "تحویل داده شده"
      case "cancelled":
        return "لغو شده"
      default:
        return status
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 space-y-6">
            <div className="text-center py-6">
              <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-3">مدیریت سفارشات</h1>
              <p className="text-wood-medium text-lg mb-6">پیگیری و مدیریت خریدهای مشتریان</p>

              <div className="flex justify-center mt-8">
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-wood-dark hover:bg-wood-dark hover:text-white bg-transparent text-wood-dark font-semibold px-8 transition-all"
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                    بازگشت به پنل اصلی
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-2 border-wood-light/40 wood-texture">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-wood-dark mb-1">{purchases.length}</p>
                  <p className="text-sm text-muted-foreground">کل سفارشات</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-wood-light/40 wood-texture">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600 mb-1">
                    {purchases.filter((p) => p.status === "pending").length}
                  </p>
                  <p className="text-sm text-muted-foreground">در انتظار</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-wood-light/40 wood-texture">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 mb-1">
                    {purchases.filter((p) => p.status === "processing").length}
                  </p>
                  <p className="text-sm text-muted-foreground">در حال پردازش</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-wood-light/40 wood-texture">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 mb-1">
                    {purchases.filter((p) => p.status === "delivered").length}
                  </p>
                  <p className="text-sm text-muted-foreground">تحویل شده</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchases List */}
          <div className="space-y-6">
            {purchases.map((purchase) => (
              <Card key={purchase.id} className="border-2 border-wood-light/40 wood-texture">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-wood-dark mb-2">سفارش #{purchase.orderId}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {purchase.orderDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {purchase.customerName}
                        </span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(purchase.status)} text-white`}>
                      {getStatusLabel(purchase.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div>
                    <h3 className="font-bold text-wood-dark mb-2">اقلام سفارش:</h3>
                    <div className="space-y-2">
                      {purchase.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-wood-light/10 rounded">
                          <span className="text-wood-dark">
                            {item.title} × {item.quantity}
                          </span>
                          <span className="font-bold text-wood-medium">{item.price.toLocaleString("fa-IR")} یورو</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center p-3 bg-wood-medium/10 rounded-lg border-2 border-wood-light/40">
                    <span className="font-bold text-wood-dark flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      مجموع:
                    </span>
                    <span className="text-xl font-bold text-wood-dark">
                      {purchase.totalAmount.toLocaleString("fa-IR")} یورو
                    </span>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="font-bold text-wood-dark mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      آدرس ارسال:
                    </h3>
                    <p className="text-wood-medium p-2 bg-wood-light/10 rounded">{purchase.shippingAddress}</p>
                  </div>

                  {/* Status Change */}
                  <div>
                    <h3 className="font-bold text-wood-dark mb-2">تغییر وضعیت:</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(purchase.id, "pending")}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                        disabled={purchase.status === "pending"}
                      >
                        در انتظار
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(purchase.id, "processing")}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={purchase.status === "processing"}
                      >
                        در حال پردازش
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(purchase.id, "shipped")}
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                        disabled={purchase.status === "shipped"}
                      >
                        ارسال شده
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(purchase.id, "delivered")}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        disabled={purchase.status === "delivered"}
                      >
                        تحویل داده شده
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(purchase.id, "cancelled")}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        disabled={purchase.status === "cancelled"}
                      >
                        لغو شده
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
