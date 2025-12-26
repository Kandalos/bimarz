"use client"; // important for useEffect

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axiosInstance"

export function RecommendedBooksSection() {
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendedBooks() {
      try {
        const response = await axiosInstance.get("v1/shop/books/recommended/recommended/")
        setRecommendedBooks(response.data.books || [])
      } catch (error) {
        console.error("Failed to fetch recommended books:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedBooks()
  }, [])

  if (loading) {
    return <p className="text-center py-12">در حال بارگذاری...</p>
  }

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-wood-dark">
            پیشنهادی ما
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            بگو چی خوندی؟ تا بگم چی بخونی!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {recommendedBooks.map((book: any) => (
            <Link key={book.id} href={`/shop/${book.id}`}>
              <div className="group bg-white rounded-lg border-2 border-wood-light/40 overflow-hidden hover:border-wood-medium transition-all hover:shadow-xl wood-texture h-full">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={book.cover_image || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base text-wood-dark mb-1 line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{book.author}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-wood-medium">{book.price} یورو</span>
                    <span className="flex items-center gap-1 text-sm text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      {book.rating || 5}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
