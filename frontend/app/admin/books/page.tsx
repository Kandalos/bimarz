"use client"

import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import {
  Package,
  ArrowRight,
  Plus,
  X,
  Edit2,
  Trash2,
  Grid3X3,
  List,
  ImagePlus,
} from "lucide-react"
import apiService from "@/lib/apiService"

type Genre = {
  id: number
  name: string
  slug: string
}

type Event = {
  id: number
  title: string
  description: string
  date_time: string
  location: string
  is_public: boolean
  image?: string | null
}

type Book = {
  id: number
  title: string
  author: string
  pages?: number
  year?: number
  book_size?: string
  translator?: string | null
  description?: string
  cover_image?: string | null
  cover?: string | null
  genre?: string
  genres?: Genre[]
  isbn?: string
  price?: number
  stock?: number
}

export default function AdminPage() {
  // Tabs + view mode state
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState<"events" | "books">("books")
  const [booksViewMode, setBooksViewMode] = useState<"grid" | "list">("grid")
  const [eventsViewMode, setEventsViewMode] = useState<"grid" | "list">("grid")
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [eventFormData, setEventFormData] = useState<Partial<Event>>({})
  const [eventImageFile, setEventImageFile] = useState<File | null>(null)

  // Events (mock)
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)

  // Books coming from API
  const [books, setBooks] = useState<Book[]>([])
  const [booksLoading, setBooksLoading] = useState(false)
  const [booksError, setBooksError] = useState<string | null>(null)

  // Genres coming from API
  const [genres, setGenres] = useState<Genre[]>([])
  const [genresLoading, setGenresLoading] = useState(false)
  const [genresError, setGenresError] = useState<string | null>(null)

  // Form / editing state
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [bookFormData, setBookFormData] = useState<Partial<Book>>({})
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([])
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Simple notification state for success
  const [notif, setNotif] = useState<string | null>(null)

  // --- Fetch books from API ---
  const fetchBooks = async () => {
    setBooksLoading(true)
    setBooksError(null)
    try {
      // note: use your apiService (it has baseURL '/api/')
      const res = await apiService.get("/v1/shop/books/")
      // backend returns array of books
      setBooks(res.data || [])
    } catch (err: any) {
      console.error("fetchBooks error:", err)
      setBooksError(
        err?.response?.data?.detail ||
          err?.message ||
          "خطا در دریافت کتاب‌ها از سرور"
      )
    } finally {
      setBooksLoading(false)
    }
  }

  // --- Fetch genres from API ---
  const fetchGenres = async () => {
    setGenresLoading(true)
    setGenresError(null)
    try {
      const res = await apiService.get("/v1/shop/genres/")
      setGenres(res.data || [])
      console.log("Genres fetched:", res.data) // Debug log
    } catch (err: any) {
      console.error("fetchGenres error:", err)
      setGenresError(
        err?.response?.data?.detail ||
          err?.message ||
          "خطا در دریافت ژانرها از سرور"
      )
    } finally {
      setGenresLoading(false)
    }
  }

  const fetchEvents = async () => {
    setEventsLoading(true)
    try {
      const res = await apiService.get("/v1/events/")
      setEvents(res.data || [])
    } catch (err) {
      console.error("fetchEvents error:", err)
    } finally {
      setEventsLoading(false)
    }
  }

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await apiService.get("/v1/core/users/me/")

        // 👇 STRICT check
        if (!res.data?.is_superuser) {
          router.replace("/login")
          return
        }

        // allowed
        setCheckingAuth(false)
      } catch (err) {
        router.replace("/login")
      }
    }

    checkAdmin()
  }, [])

  useEffect(() => {
    fetchBooks()
    fetchGenres()
    fetchEvents()
  }, [])

  // --- Helpers ---
  const resetForm = () => {
    setEditingBook(null)
    setBookFormData({})
    setCoverFile(null)
    setSelectedGenreIds([])
    setShowBookForm(false)
    setFormError(null)
  }

  const openCreateForm = () => {
    setEditingBook(null)
    setBookFormData({})
    setCoverFile(null)
    setSelectedGenreIds([])
    setShowBookForm(true)
  }

  const handleEditBook = (b: Book) => {
    // Map fields from API to form fields
    setEditingBook(b)
    setBookFormData({
      id: b.id,
      title: b.title,
      author: b.author,
      pages: b.pages,
      year: b.year,
      description: b.description,
      isbn: b.isbn,
      price: b.price,
      stock: b.stock,
      translator: b.translator,
      book_size: b.book_size,
      genre: b.genre,
      cover: b.cover_image || "",
    })
    // Set selected genre IDs as strings
    if (b.genres && b.genres.length > 0) {
      setSelectedGenreIds(b.genres.map(g => String(g.id)))
    } else {
      setSelectedGenreIds([])
    }
    setCoverFile(null)
    setShowBookForm(true)
  }

  // --- Delete ---
  const handleDeleteBook = async (id: number) => {
    if (!confirm("آیا از حذف این کتاب اطمینان دارید؟")) return
    try {
      await apiService.delete(`/v1/shop/books/${id}/`)
      setNotif("کتاب با موفقیت حذف شد")
      setBooks((prev) => prev.filter((b) => b.id !== id))
      setTimeout(() => setNotif(null), 2500)
    } catch (err: any) {
      console.error("delete error:", err)
      alert(
        err?.response?.data?.detail ||
          "خطا در حذف کتاب — ممکن است دسترسی کافی نداشته باشید."
      )
    }
  }

  // --- Create / Update ---
  const handleBookFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target
    setBookFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setSelectedGenreIds(selectedOptions)
    console.log("Selected genres:", selectedOptions) // Debug log
  }

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setCoverFile(f)
    if (f) {
      // preview URL assignment (not persisted)
      setBookFormData((prev) => ({ ...prev, cover: URL.createObjectURL(f) }))
    }
  }

  const submitBookForm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setFormError(null)
    setFormSaving(true)

    // minimal client-side validation
    if (!bookFormData.title || !bookFormData.author) {
      setFormError("لطفاً عنوان و نام نویسنده را وارد کنید.")
      setFormSaving(false)
      return
    }

    try {
      // if editing -> PATCH /v1/shop/books/{id}/
      const isEdit = Boolean(editingBook && editingBook.id)
      const endpoint = isEdit
        ? `/v1/shop/books/${editingBook!.id}/`
        : `/v1/shop/books/`

      // Build FormData for file upload (backend accepts multipart)
      const form = new FormData()
      // Append text fields (only those present)
      const appendIf = (k: string, val: any) => {
        if (typeof val !== "undefined" && val !== null) form.append(k, String(val))
      }
      // REQUIRED
      appendIf("title", bookFormData.title)
      appendIf("author", bookFormData.author)

      // OPTIONAL TEXT
      appendIf("description", bookFormData.description)
      appendIf("isbn", bookFormData.isbn)
      appendIf("translator", bookFormData.translator)
      appendIf("genre", bookFormData.genre)
      appendIf("book_size", bookFormData.book_size)

      // OPTIONAL NUMBERS
      appendIf("price", bookFormData.price)
      appendIf("stock", bookFormData.stock)
      appendIf("pages", bookFormData.pages)
      appendIf("year", bookFormData.year)

      // Append genre_ids (required field)
      selectedGenreIds.forEach(id => {
        form.append("genre_ids", id)
      })

      // if you want to handle genres as ids, you'd append genre_ids (not included in form UI)
      // append file if present
      if (coverFile) {
        form.append("cover_image", coverFile)
      } else if (!coverFile && !bookFormData.cover && isEdit) {
        // if editing and explicitly removed cover preview, you may want to clear it
        // backend expects either omission or explicit null; here we omit to keep existing.
      }

      // Use axios request with proper headers: apiService will set JSON header by default,
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }

      let res
      if (isEdit) {
        res = await apiService.patch(endpoint, form, config)
      } else {
        res = await apiService.post(endpoint, form, config)
      }

      // Update local list
      const saved = res.data
      if (isEdit) {
        setBooks((prev) => prev.map((b) => (b.id === saved.id ? saved : b)))
        setNotif("ویرایش کتاب با موفقیت انجام شد.")
      } else {
        setBooks((prev) => [saved, ...prev])
        setNotif("کتاب جدید با موفقیت اضافه شد.")
      }
      setTimeout(() => setNotif(null), 2500)
      resetForm()
    } catch (err: any) {
      console.error("save book error:", err)
      // Try to extract reason from backend response
      const backendMsg =
        err?.response?.data ||
        err?.response?.data?.detail ||
        err?.message ||
        "خطا در ذخیره کتاب"
      // backend may return object with field errors
      if (typeof backendMsg === "object") {
        // join messages
        const combined = Object.keys(backendMsg)
          .map((k) => `${k}: ${JSON.stringify(backendMsg[k])}`)
          .join(" | ")
        setFormError(combined)
      } else {
        setFormError(String(backendMsg))
      }
    } finally {
      setFormSaving(false)
    }
  }

  // --- Event handlers (local mock) ---
  const handleDeleteEvent = async (id: number) => {
    if (!confirm("آیا از حذف این رویداد اطمینان دارید؟")) return
    try {
      await apiService.delete(`/v1/events/${id}/`)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      alert("خطا در حذف رویداد")
    }
  }

  const handleCancelBook = () => {
    resetForm()
  }

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingBook) {
      // not used for events
    }
    // keep events local like before
    // omitted for brevity — your existing code handles this
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-wood-dark">
        در حال بررسی دسترسی...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12 space-y-6">
            <div className="text-center py-6">
              <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-3">مدیریت کتاب‌ها</h1>
              <p className="text-wood-medium text-lg mb-6">افزودن، ویرایش و حذف کتاب‌های فروشگاه</p>

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

          {/* BOOKS */}
          {activeTab === "books" && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button
                  onClick={openCreateForm}
                  disabled={showBookForm}
                  className="flex items-center gap-2 bg-wood-dark hover:bg-wood-medium text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5" />
                  افزودن کتاب جدید
                </button>

                <div className="flex gap-2 bg-wood-light/20 p-2 rounded-lg">
                  <button
                    onClick={() => setBooksViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      booksViewMode === "grid"
                        ? "bg-wood-dark text-white"
                        : "text-wood-medium hover:text-wood-dark"
                    }`}
                    title="نمایش جدولی"
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setBooksViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      booksViewMode === "list"
                        ? "bg-wood-dark text-white"
                        : "text-wood-medium hover:text-wood-dark"
                    }`}
                    title="نمایش فهرستی"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Book form */}
              {showBookForm && (
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border-2 border-wood-light/40 wood-texture">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-wood-dark">
                      {editingBook ? "ویرایش کتاب" : "افزودن کتاب جدید"}
                    </h2>
                    <button onClick={handleCancelBook} className="text-gray-500 hover:text-gray-700">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={submitBookForm} encType="multipart/form-data" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="title" className="text-wood-dark font-bold mb-2 block">
                          عنوان کتاب
                        </Label>
                        <Input
                          id="title"
                          placeholder="عنوان کتاب را وارد کنید"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.title || ""}
                          onChange={handleBookFormChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="author" className="text-wood-dark font-bold mb-2 block">
                          نویسنده
                        </Label>
                        <Input
                          id="author"
                          placeholder="نام نویسنده را وارد کنید"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.author || ""}
                          onChange={handleBookFormChange}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="translator" className="text-wood-dark font-bold mb-2 block">
                          مترجم
                        </Label>
                        <Input
                          id="translator"
                          placeholder="نام مترجم را وارد کنید"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.translator || ""}
                          onChange={handleBookFormChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="book_size" className="text-wood-dark font-bold mb-2 block">
                          قطع کتاب
                        </Label>
                        <select
                          id="book_size"
                          className="w-full border border-wood-light rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-wood-medium"
                          value={bookFormData.book_size || "B5"}
                          onChange={handleBookFormChange}
                        >
                          <option value="A5">A5 (148 × 210)</option>
                          <option value="B5">B5 (176 × 250)</option>
                          <option value="A4">A4 (210 × 297)</option>
                          <option value="POCKET">جیبی</option>
                          <option value="CUSTOM">سفارشی</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="pages" className="text-wood-dark font-bold mb-2 block">
                          تعداد صفحات
                        </Label>
                        <Input
                          id="pages"
                          type="number"
                          placeholder="0"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.pages ?? ""}
                          onChange={handleBookFormChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="year" className="text-wood-dark font-bold mb-2 block">
                          سال انتشار
                        </Label>
                        <Input
                          id="year"
                          type="number"
                          placeholder={new Date().getFullYear().toString()}
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.year ?? ""}
                          onChange={handleBookFormChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="isbn" className="text-wood-dark font-bold mb-2 block">
                          شابک (ISBN)
                        </Label>
                        <Input
                          id="isbn"
                          placeholder="9783161484100"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.isbn || ""}
                          onChange={handleBookFormChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-wood-dark font-bold mb-2 block">
                        توضیحات
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="توضیحات کتاب را وارد کنید"
                        rows={4}
                        className="border-wood-light focus:border-wood-medium"
                        value={bookFormData.description || ""}
                        onChange={handleBookFormChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="genres" className="text-wood-dark font-bold mb-2 block">
                        ژانرها
                      </Label>
                      {genresLoading ? (
                        <p>در حال بارگذاری ژانرها...</p>
                      ) : genresError ? (
                        <p className="text-red-500">{genresError}</p>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {genres.map((genre) => (
                              <div key={genre.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`genre-${genre.id}`}
                                  value={genre.id}
                                  checked={selectedGenreIds.includes(String(genre.id))}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedGenreIds(prev => [...prev, String(genre.id)])
                                    } else {
                                      setSelectedGenreIds(prev => prev.filter(id => id !== String(genre.id)))
                                    }
                                  }}
                                  className="mr-2"
                                />
                                <label htmlFor={`genre-${genre.id}`} className="cursor-pointer">
                                  {genre.name}
                                </label>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">می‌توانید چند ژانر را انتخاب کنید</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="cover" className="text-wood-dark font-bold mb-2 block">
                        تصویر جلد کتاب
                      </Label>

                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded bg-wood-light/20 hover:bg-wood-light/30">
                          <ImagePlus className="w-4 h-4" />
                          <span>بارگذاری تصویر</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleCoverSelect} />
                        </label>

                        <Input
                          id="cover-url"
                          type="text"
                          placeholder="لینک تصویر (اختیاری)"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.cover || ""}
                          onChange={(e) => setBookFormData((p) => ({ ...p, cover: e.target.value }))}
                        />
                      </div>

                      {bookFormData.cover && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-wood-light/40 w-32">
                          <img
                            src={bookFormData.cover}
                            alt="پیش‌نمایش جلد"
                            className="w-full h-40 object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="price" className="text-wood-dark font-bold mb-2 block">
                          قیمت (تومان)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="0"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.price ?? ""}
                          onChange={handleBookFormChange}
                        />
                      </div>

                      <div>
                        <Label htmlFor="stock" className="text-wood-dark font-bold mb-2 block">
                          موجودی (تعداد)
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          placeholder="0"
                          className="border-wood-light focus:border-wood-medium"
                          value={bookFormData.stock ?? ""}
                          onChange={handleBookFormChange}
                        />
                      </div>
                    </div>

                    {formError && <p className="text-sm text-red-500">{formError}</p>}

                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={formSaving}
                        className="flex-1 bg-wood-medium hover:bg-wood-dark text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        {formSaving ? (editingBook ? "در حال ذخیره..." : "در حال افزودن...") : editingBook ? "ذخیره تغییرات" : "افزودن کتاب"}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelBook}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        انصراف
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Books list */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border-2 border-wood-light/40 wood-texture">
                <h2 className="text-2xl font-bold text-wood-dark mb-6">کتاب‌ها ({books.length})</h2>

                {booksLoading ? (
                  <p className="text-center text-wood-medium">در حال بارگذاری کتاب‌ها...</p>
                ) : booksError ? (
                  <p className="text-center text-red-500">{booksError}</p>
                ) : books.length === 0 ? (
                  <p className="text-wood-medium text-center py-8">کتابی موجود نیست</p>
                ) : (
                  <div className={booksViewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "grid gap-4"}>
                    {books.map((book) => (
                      <div key={book.id} className={`p-4 border-l-4 border-wood-medium bg-wood-light/10 rounded-lg hover:shadow-md transition-shadow ${booksViewMode === "grid" ? "flex flex-row gap-4 items-start" : "flex flex-row gap-4 items-start"}`}>
                        <div className="flex-1 flex flex-col">
                          <h3 className="text-lg font-bold text-wood-dark mb-1">{book.title}</h3>
                          <p className="text-wood-medium mb-2"><span className="font-bold">نویسنده:</span> {book.author}</p>
                          <p className="text-sm text-wood-dark/70 mb-2">
                            {book.genres && book.genres.length > 0 && (
                              <>
                                <span className="font-bold">ژانر:</span> {book.genres.map(g => g.name).join(", ")} | 
                              </>
                            )}
                            <span className="font-bold">صفحات:</span> {book.pages ?? "—"} | <span className="font-bold">سال:</span> {book.year ?? "—"}
                          </p>
                          {book.description && <p className="text-wood-dark/80 text-sm line-clamp-2 mb-4">{book.description}</p>}

                          <div className="flex gap-2 mt-auto">
                            <button onClick={() => handleEditBook(book)} className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-2.5 rounded text-xs transition-colors" title="ویرایش">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteBook(book.id!)} className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-2.5 rounded text-xs transition-colors" title="حذف">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {book.cover_image || (book as any).cover ? (
                          <div className="flex-shrink-0">
                            <img src={book.cover_image || (book as any).cover || "/placeholder.svg"} alt={book.title} className="w-20 h-28 object-cover rounded-lg border border-wood-light/40 shadow-md" />
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EVENTS (local) */}
          {activeTab === "events" && (
            <div className="space-y-8">
              {/* (your existing events UI — left intact) */}
              <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg border-2 border-wood-light/40 wood-texture">
                <h2 className="text-2xl font-bold text-wood-dark mb-6">رویدادهای موجود ({events.length})</h2>
                {events.length === 0 ? (
                  <p className="text-wood-medium text-center py-8">رویدادی موجود نیست</p>
                ) : (
                  <div className={eventsViewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid gap-4"}>
                    {events.map((event) => (
                      <div key={event.id} className={`p-4 border-2 border-wood-light/40 rounded-lg hover:border-wood-medium/60 transition-colors ${eventsViewMode === "grid" ? "flex flex-col" : "flex flex-col md:flex-row md:items-center md:justify-between gap-4"}`}>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-wood-dark mb-2">{event.title}</h3>
                          <p className="text-wood-medium mb-2"><span className="font-bold">تاریخ:</span> {new Date(event.date_time).toLocaleDateString("fa-IR")} —{" "}
                          {new Date(event.date_time).toLocaleTimeString("fa-IR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          </p>
                          <p className="text-wood-medium mb-2"><span className="font-bold">مکان:</span> {event.location}</p>
                          <p className="text-wood-dark/80 line-clamp-2">{event.description}</p>
                        </div>
                        {event.image && (
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-40 object-cover rounded-lg mb-3"
                          />
                        )}

                        <div className={`flex gap-2 ${eventsViewMode === "grid" ? "flex-row" : "md:flex-col"}`}>
                          <Button onClick={() => setEvents(events.map(ev => ev.id === event.id ? {...ev, title: ev.title + " (ویرایش)" } : ev))} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none">ویرایش</Button>
                          <Button onClick={() => handleDeleteEvent(event.id)} className="bg-red-600 hover:bg-red-700 text-white flex-1 md:flex-none">حذف</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* notifications */}
      {notif && (
        <div className="fixed bottom-6 right-6 bg-wood-dark text-white px-4 py-2 rounded shadow-lg">
          {notif}
        </div>
      )}

      <Footer />
    </main>
  )
}