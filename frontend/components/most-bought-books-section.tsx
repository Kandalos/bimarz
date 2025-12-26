"use client";

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axiosInstance"

export function MostBoughtBooksSection() {
  const [mostBoughtBooks, setMostBoughtBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMostBoughtBooks() {
      try {
        const response = await axiosInstance.get("v1/shop/books/recommended/most-bought/")
        setMostBoughtBooks(response.data.books || [])
      } catch (error) {
        console.error("Failed to fetch most bought books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMostBoughtBooks()
  }, [])

  if (loading) {
    return <p className="text-center py-12">در حال بارگذاری...</p>
  }

  return (
    <section className="py-24 px-6 bg-wood-light/10">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-wood-medium" />
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-wood-dark">
              داغ‌ترین کتاب‌ها
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            محبوب‌ترین انتخاب‌های خوانندگان ما
          </p>
        </div>

        {/* Books */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {mostBoughtBooks.map((book: any) => (
            <Link key={book.id} href={`/shop/${book.id}`}>
              <div className="group bg-white rounded-lg border-2 border-wood-light/40 hover:border-wood-medium hover:shadow-xl transition-all overflow-hidden h-full">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={book.cover_image || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-wood-dark text-white px-3 py-1 rounded-md flex items-center gap-1 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>{book.sold_count}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-base text-wood-dark mb-1 line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-wood-medium">{book.price} یورو</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Button */}
        <div className="text-center">
          <Link href="/shop">
            <Button className="bg-wood-medium hover:bg-wood-dark text-white px-8 py-6 text-lg">
              مشاهده همه کتاب‌ها
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
