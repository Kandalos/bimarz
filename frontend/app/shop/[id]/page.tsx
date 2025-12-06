"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowRight, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import apiService from "@/lib/apiService";
import { useParams } from "next/navigation";


export default function BookDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [book, setBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const res = await apiService.get(`v1/shop/books/${id}/`);
        setBook(res.data);
      } catch (e: any) {
        console.error(e);
        setErr("خطا در بارگذاری اطلاعات کتاب");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBook();
  }, [id]);

  const handleAddToCart = () => {
    alert(`${quantity} عدد از کتاب "${book.title}" به سبد خرید اضافه شد`);
    // TODO: plug into cart API or local cart state
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>در حال بارگذاری...</p>
      </main>
    );
  }

  if (!book || err) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{err || "کتابی یافت نشد"}</p>
      </main>
    );
  }

  const shouldShowExpandButton = book.description && book.description.length > 150;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <Link href="/shop" className="inline-flex items-center gap-2 text-wood-medium hover:text-wood-dark mb-6 transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span>بازگشت به فروشگاه</span>
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="relative">
              <div className="sticky top-24">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-wood-light/40 shadow-2xl">
                  <img src={book.cover_image ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${book.cover_image}` : "/placeholder.svg"} alt={book.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Badge className="mb-3 bg-wood-light text-wood-dark">{(book.genres || []).map((g:any)=>g.name).join(" ، ")}</Badge>
                <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-4">{book.title}</h1>
                <p className="text-xl text-wood-medium mb-2">نویسنده: {book.author}</p>
                <p className="text-lg text-muted-foreground">ناشر: {book.publisher || "—"}</p>
              </div>

              <div className="border-t border-b border-wood-light/40 py-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تعداد صفحات:</span>
                  <span className="font-medium text-wood-dark">{book.pages || "—"} صفحه</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سال انتشار:</span>
                  <span className="font-medium text-wood-dark">{book.year || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">شابک:</span>
                  <span className="font-medium text-wood-dark">{book.isbn}</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-wood-dark mb-3">درباره کتاب</h2>
                <div className="relative">
                  <p className={`text-base leading-relaxed text-muted-foreground transition-all duration-300 ${!isDescriptionExpanded && shouldShowExpandButton ? "line-clamp-3" : ""}`}>
                    {book.description}
                  </p>
                  {shouldShowExpandButton && (
                    <button onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} className="mt-2 inline-flex items-center gap-1 text-wood-medium hover:text-wood-dark font-medium transition-colors">
                      {isDescriptionExpanded ? <> <span>کمتر</span> <ChevronUp className="w-4 h-4" /> </> : <> <span>بیشتر</span> <ChevronDown className="w-4 h-4" /> </>}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-wood-light/10 rounded-lg p-6 border-2 border-wood-light/40 wood-texture">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-wood-dark">{Number(book.price).toLocaleString("fa-IR")} تومان</span>
                  {book.stock > 0 ? (
                    <Badge className="bg-green-500 text-white">موجود</Badge>
                  ) : (
                    <Badge variant="destructive">ناموجود</Badge>
                  )}
                </div>

                {book.stock > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-wood-dark font-medium">تعداد:</span>
                      <div className="flex items-center gap-2">
                        <Button size="icon-sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-bold text-wood-dark">{quantity}</span>
                        <Button size="icon-sm" variant="outline" onClick={() => setQuantity(quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleAddToCart} className="w-full bg-wood-medium hover:bg-wood-dark text-white">
                      <ShoppingCart className="w-5 h-5 ml-2" />
                      افزودن به سبد خرید
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
