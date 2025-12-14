"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Calendar, Package } from "lucide-react"

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-2 text-center">پنل مدیریت</h1>
            <p className="text-center text-wood-medium text-lg">انتخاب کنید چه چیزی را می‌خواهید مدیریت کنید</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Books Management */}
            <Link href="/admin/books">
              <Card className="border-2 border-wood-light/40 wood-texture hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-wood-medium/20 rounded-full">
                      <BookOpen className="w-12 h-12 text-wood-dark" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center text-wood-dark">مدیریت کتاب‌ها</CardTitle>
                  <CardDescription className="text-center text-wood-medium">
                    افزودن، ویرایش و حذف کتاب‌ها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-wood-dark/70">
                    مدیریت کامل کتاب‌های موجود در فروشگاه با امکان تنظیم جزئیات هر کتاب
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Events Management */}
            <Link href="/admin/events">
              <Card className="border-2 border-wood-light/40 wood-texture hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-wood-medium/20 rounded-full">
                      <Calendar className="w-12 h-12 text-wood-dark" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center text-wood-dark">مدیریت رویدادها</CardTitle>
                  <CardDescription className="text-center text-wood-medium">
                    سازماندهی رویدادها و نشست‌ها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-wood-dark/70">
                    ایجاد و مدیریت رویدادهای فرهنگی، ادبی و کارگاه‌های آموزشی
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Orders Management */}
            <Link href="/admin/purchases">
              <Card className="border-2 border-wood-light/40 wood-texture hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-wood-medium/20 rounded-full">
                      <Package className="w-12 h-12 text-wood-dark" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center text-wood-dark">مدیریت سفارشات</CardTitle>
                  <CardDescription className="text-center text-wood-medium">پیگیری و مدیریت خریدها</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-center text-wood-dark/70">مشاهده سفارشات مشتریان و تغییر وضعیت آن‌ها</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
