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
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import apiService from "@/lib/apiService";
import { useParams, useRouter } from "next/navigation";

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
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

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

  // ── Frontend stock guard ──────────────────────────────────
  const availableStock: number = book?.stock ?? 0;

  const incrementQty = () => {
    if (quantity < availableStock) {
      setQuantity(q => q + 1);
      setCartError(null);
    } else {
      setCartError(`حداکثر موجودی: ${availableStock} جلد`);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity(q => q - 1);
    setCartError(null);
  };
  // ─────────────────────────────────────────────────────────

  const handleAddToCart = async () => {
    if (!book) return;
    setCartError(null);

    // Frontend validation before hitting the API
    if (availableStock <= 0) {
      setCartError("این کتاب موجود نیست.");
      return;
    }
    if (quantity > availableStock) {
      setCartError(`فقط ${availableStock} جلد موجود است.`);
      setQuantity(availableStock);
      return;
    }

    setAddingToCart(true);
    try {
      await apiService.post('/orders/cart/add/', {
        book_id: book.id,
        quantity,
      });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push('/login?redirect=' + encodeURIComponent(`/shop/${id}`));
        return;
      }
      // Show server-side stock error
      const serverMsg =
        error.response?.data?.error ||
        'خطا در افزودن به سبد خرید. لطفاً دوباره تلاش کنید.';
      setCartError(serverMsg);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wood-medium" />
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
            {/* Cover Image */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-wood-light/40 shadow-2xl">
                  <img src={imageUrl} alt={book.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                {(book.genres || []).length > 0 && (
                  <Badge className="mb-3 bg-wood-light text-wood-dark">
                    {book.genres.map((g: any) => g.name).join(" ، ")}
                  </Badge>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-4">{book.title}</h1>
                <p className="text-xl text-wood-medium mb-1">نویسنده: {book.author}</p>
                {book.translator && (
                  <p className="text-lg text-wood-medium mb-1">مترجم: {book.translator}</p>
                )}
                <p className="text-lg text-muted-foreground">ناشر: {book.publisher || "—"}</p>
              </div>

              {/* Specs */}
              <div className="border-t border-b border-wood-light/40 py-6 space-y-3">
                {book.pages && <Spec label="تعداد صفحات" value={book.pages} />}
                {book.year && <Spec label="سال انتشار" value={book.year} />}
                {book.isbn && <Spec label="شابک" value={book.isbn} />}
                {book.book_size && (
                  <Spec label="قطع" value={BOOK_SIZE_LABELS[book.book_size] || book.book_size} />
                )}
              </div>

              {/* Price & Stock */}
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-wood-dark">
                  {Number(book.price).toLocaleString("fa-IR")} تومان
                </span>
                {availableStock > 0 ? (
                  <Badge className="bg-green-500 text-white">
                    موجود ({availableStock} جلد)
                  </Badge>
                ) : (
                  <Badge variant="destructive">ناموجود</Badge>
                )}
              </div>

              {/* Add to cart */}
              {availableStock > 0 && (
                <div className="space-y-3">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-wood-dark font-medium">تعداد:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={decrementQty}
                        disabled={addingToCart || quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-wood-dark">{quantity}</span>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={incrementQty}
                        disabled={addingToCart || quantity >= availableStock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {quantity >= availableStock && (
                      <span className="text-xs text-amber-600">حداکثر موجودی</span>
                    )}
                  </div>

                  {/* Error feedback */}
                  {cartError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {cartError}
                    </div>
                  )}

                  {/* Success feedback */}
                  {cartSuccess && (
                    <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      ✓ به سبد خرید اضافه شد!
                    </div>
                  )}

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-wood-medium hover:bg-wood-dark text-white disabled:opacity-50"
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        در حال افزودن...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        افزودن به سبد خرید
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Description */}
              {book.description && (
                <div>
                  <h2 className="text-xl font-bold text-wood-dark mb-3">درباره کتاب</h2>
                  <div className={`text-wood-medium leading-relaxed ${!isDescriptionExpanded && shouldShowExpandButton ? "line-clamp-3" : ""}`}>
                    {book.description}
                  </div>
                  {shouldShowExpandButton && (
                    <button
                      onClick={() => setIsDescriptionExpanded(p => !p)}
                      className="mt-2 text-wood-medium hover:text-wood-dark text-sm flex items-center gap-1"
                    >
                      {isDescriptionExpanded ? (
                        <><ChevronUp className="w-4 h-4" />نمایش کمتر</>
                      ) : (
                        <><ChevronDown className="w-4 h-4" />نمایش بیشتر</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-wood-dark">{value}</span>
    </div>
  );
}