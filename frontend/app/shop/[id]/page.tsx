"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  ArrowRight,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import apiService from "@/lib/apiService";
import { useParams } from "next/navigation";

/* ----------------------------------
   Helpers
---------------------------------- */

const BOOK_SIZE_LABELS: Record<string, string> = {
  JIBI_SHOMIZ: "جیبی (شومیز)",
  JIBI_GHALINGOR: "جیبی (گالینگور)",
  PALTUI_SHOMIZ: "پالتویی (شومیز)",
  PALTUI_GHALINGOR: "پالتویی (گالینگور)",
  RAGHEI_SHOMIZ: "رقعی (شومیز)",
  RAGHEI_GHALINGOR: "رقعی (گالینگور)",
  VAZIRI_SHOMIZ: "وزیری (شومیز)",
  VAZIRI_GHALINGOR: "وزیری (گالینگور)",
  RAHLI_SHOMIZ: "رحلی (شومیز)",
  RAHLI_GHALINGOR: "رحلی (گالینگور)",
  KHESHTI_SHOMIZ: "خشتی (شومیز)",
  KHESHTI_GHALINGOR: "خشتی (گالینگور)",
};

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
      } catch (e) {
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

  const shouldShowExpandButton =
    book.description && book.description.length > 150;

  const imageUrl = book.cover_image
    ? book.cover_image.startsWith("http")
      ? book.cover_image
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}${book.cover_image}`
    : "/placeholder.svg";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-wood-medium hover:text-wood-dark mb-6 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            <span>بازگشت به فروشگاه</span>
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-wood-light/40 shadow-2xl">
                  <img
                    src={imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Title & Meta */}
              <div>
                {(book.genres || []).length > 0 && (
                  <Badge className="mb-3 bg-wood-light text-wood-dark">
                    {book.genres.map((g: any) => g.name).join(" ، ")}
                  </Badge>
                )}

                <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-4">
                  {book.title}
                </h1>

                <p className="text-xl text-wood-medium mb-1">
                  نویسنده: {book.author}
                </p>

                {book.translator && (
                  <p className="text-lg text-wood-medium mb-1">
                    مترجم: {book.translator}
                  </p>
                )}

                <p className="text-lg text-muted-foreground">
                  ناشر: {book.publisher || "—"}
                </p>
              </div>

              {/* Specs */}
              <div className="border-t border-b border-wood-light/40 py-6 space-y-3">
                <Spec label="تعداد صفحات" value={book.pages ? `${book.pages} صفحه` : "—"} />
                <Spec label="سال انتشار" value={book.year || "—"} />
                <Spec label="شابک" value={book.isbn || "—"} />
                <Spec
                  label="قطع کتاب"
                  value={
                    BOOK_SIZE_LABELS[book.book_size] || "—"
                  }
                />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-wood-dark mb-3">
                  درباره کتاب
                </h2>
                <div className="relative">
                  <p
                    className={`text-base leading-relaxed text-muted-foreground transition-all duration-300 ${
                      !isDescriptionExpanded && shouldShowExpandButton
                        ? "line-clamp-3"
                        : ""
                    }`}
                  >
                    {book.description}
                  </p>
                  {shouldShowExpandButton && (
                    <button
                      onClick={() =>
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }
                      className="mt-2 inline-flex items-center gap-1 text-wood-medium hover:text-wood-dark font-medium transition-colors"
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <span>کمتر</span>
                          <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>بیشتر</span>
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Purchase Box */}
              <div className="bg-wood-light/10 rounded-lg p-6 border-2 border-wood-light/40 wood-texture">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-wood-dark">
                    {Number(book.price).toLocaleString("fa-IR")} یورو
                  </span>
                  {book.stock > 0 ? (
                    <Badge className="bg-green-500 text-white">موجود</Badge>
                  ) : (
                    <Badge variant="destructive">ناموجود</Badge>
                  )}
                </div>

                {book.stock > 0 && (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-wood-dark font-medium">
                        تعداد:
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() =>
                            setQuantity(Math.max(1, quantity - 1))
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-12 text-center font-bold text-wood-dark">
                          {quantity}
                        </span>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                    >
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

/* ----------------------------------
   Small reusable spec row
---------------------------------- */
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-wood-dark">{value}</span>
    </div>
  );
}
