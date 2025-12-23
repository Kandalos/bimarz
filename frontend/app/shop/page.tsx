"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import apiService from "@/lib/apiService";

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([
    { id: "all", label: "همه" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiService.get("/v1/shop/books/");
        setBooks(res.data);
        // Try to derive categories from book payload if no dedicated endpoint
        const uniq = Array.from(
          new Set(res.data.flatMap((b: any) => (b.genres || []).map((g: any) => g.name)))
        );
        const cats = [{ id: "all", label: "همه" }, ...uniq.map((c: any) => ({ id: c, label: c }))];
        setCategories(cats);
      } catch (err: any) {
        console.error(err);
        setError("خطا در دریافت کتاب‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBooks =
    selectedCategory === "all"
      ? books
      : books.filter((book: any) => (book.genres || []).some((g: any) => g.name === selectedCategory));

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-wood-dark">فروشگاه کتاب</h1>
            <Link href="/cart">
              <Button className="bg-wood-medium hover:bg-wood-dark text-white">
                <ShoppingCart className="w-5 h-5 ml-2" />
                سبد خرید
              </Button>
            </Link>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={
                  selectedCategory === category.id
                    ? "bg-wood-medium hover:bg-wood-dark text-white"
                    : "border-wood-medium text-wood-dark hover:bg-wood-light/30"
                }
              >
                {category.label}
              </Button>
            ))}
          </div>

          {loading ? (
            <p className="text-center text-wood-medium">در حال بارگذاری...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book: any) => (
                <Link key={book.id} href={`/shop/${book.id}`}>
                  <div className="group bg-white rounded-lg border-2 border-wood-light/40 overflow-hidden hover:border-wood-medium transition-all hover:shadow-xl wood-texture">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={book.cover_image || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    {book.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          ناموجود
                        </Badge>
                      </div>
                    )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-wood-dark mb-1 line-clamp-1">{book.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{book.author}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-wood-medium">{Number(book.price).toLocaleString("fa-IR")} یورو</span>
                        {book.stock > 0 && (
                          <Button size="sm" className="bg-wood-medium hover:bg-wood-dark text-white">
                            خرید
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
