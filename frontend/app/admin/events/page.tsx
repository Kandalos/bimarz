"use client"

import type React from "react"
import { useEffect, useState } from "react"
import axiosInstance from "@/lib/axiosInstance"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { ArrowRight, Plus, Grid3X3, List, Upload, X } from "lucide-react"

type Event = {
  id: number
  title: string
  description: string
  date_time: string
  location: string
  capacity: number | null
  image?: string | null
}

export default function AdminEventsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: "",
    image: null as File | null,
    imagePreview: "" as string | null,
  })

  /* ----------------------------------
      FETCH EVENTS
  ---------------------------------- */
  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/v1/events/")
      setEvents(res.data)
    } catch (err) {
      console.error("Failed to fetch events", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  /* ----------------------------------
      DELETE EVENT
  ---------------------------------- */
  const handleDeleteEvent = async (id: number) => {
    if (!confirm("آیا از حذف این رویداد اطمینان دارید؟")) return
    try {
      await axiosInstance.delete(`/v1/events/${id}/`)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      alert("خطا در حذف رویداد")
    }
  }

  /* ----------------------------------
      EDIT EVENT
  ---------------------------------- */
  const handleEditEvent = (event: Event) => {
    const dt = new Date(event.date_time)
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: dt.toISOString().split("T")[0],
      time: dt.toTimeString().slice(0, 5),
      location: event.location,
      capacity: event.capacity?.toString() || "",
      image: null,
      imagePreview: event.image || null,
    })
    setShowEventForm(true)
  }

  const resetForm = () => {
    setEditingEvent(null)
    setShowEventForm(false)
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      capacity: "",
      image: null,
      imagePreview: null,
    })
  }

  /* ----------------------------------
      SUBMIT (CREATE / UPDATE)
  ---------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = new FormData()
    payload.append("title", formData.title)
    payload.append("description", formData.description)
    payload.append(
      "date_time",
      new Date(`${formData.date}T${formData.time}`).toISOString()
    )
    payload.append("location", formData.location)
    payload.append("is_public", "true")

    if (formData.capacity) {
      payload.append("capacity", formData.capacity)
    }

    if (formData.image) {
      payload.append("image", formData.image)
    }

    try {
      if (editingEvent) {
        await axiosInstance.put(`/v1/events/${editingEvent.id}/`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      } else {
        await axiosInstance.post("/v1/events/", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }
      await fetchEvents()
      resetForm()
    } catch (err) {
      alert("خطا در ذخیره رویداد")
    }
  }

  /* ----------------------------------
      IMAGE HANDLER
  ---------------------------------- */
  const handleImageChange = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }))
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center py-6 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-3">
              مدیریت رویدادها
            </h1>
            <p className="text-wood-medium text-lg mb-6">
              سازماندهی رویدادها و نشست‌های فرهنگی
            </p>
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

          {/* Add Button */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center gap-2 bg-wood-dark hover:bg-wood-medium text-white font-bold py-3 px-6 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              افزودن رویداد جدید
            </button>

            <div className="flex gap-2 bg-wood-light/20 p-2 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-wood-dark text-white" : ""}`}
              >
                <Grid3X3 />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-wood-dark text-white" : ""}`}
              >
                <List />
              </button>
            </div>
          </div>

          {/* FORM */}
          {showEventForm && (
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-wood-light/40 wood-texture mb-8">
              <h2 className="text-2xl font-bold text-wood-dark mb-6">
                {editingEvent ? "ویرایش رویداد" : "افزودن رویداد جدید"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <InputBlock label="عنوان" value={formData.title} onChange={(v: any) => setFormData({ ...formData, title: v })} />
                <TextareaBlock label="توضیحات" value={formData.description} onChange={(v: any) => setFormData({ ...formData, description: v })} />

                <div className="grid md:grid-cols-2 gap-4">
                  <InputBlock type="date" label="تاریخ" value={formData.date} onChange={(v: any) => setFormData({ ...formData, date: v })} />
                  <InputBlock type="time" label="ساعت" value={formData.time} onChange={(v: any) => setFormData({ ...formData, time: v })} />
                </div>

                <InputBlock label="مکان" value={formData.location} onChange={(v: any) => setFormData({ ...formData, location: v })} />
                <InputBlock label="ظرفیت" value={formData.capacity} onChange={(v: any) => setFormData({ ...formData, capacity: v })} />

                {/* IMAGE UPLOAD */}
                <div>
                  <Label className="text-wood-dark font-bold mb-2 block">تصویر رویداد</Label>
                  <label className="flex items-center gap-3 cursor-pointer bg-wood-light/30 border-2 border-wood-light rounded-lg p-4 hover:border-wood-medium transition">
                    <Upload className="w-5 h-5 text-wood-dark" />
                    <span className="text-wood-dark font-semibold">انتخاب تصویر</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageChange(e.target.files[0])}
                    />
                  </label>

                  {formData.imagePreview && (
                    <div className="mt-4 relative w-40">
                      <img
                        src={formData.imagePreview}
                        className="rounded-lg border-2 border-wood-light"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image: null, imagePreview: null })}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1 bg-wood-medium hover:bg-wood-dark text-white">
                    ذخیره
                  </Button>
                  <Button type="button" variant="secondary" className="flex-1" onClick={resetForm}>
                    انصراف
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* EVENTS LIST */}
          <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-wood-light/40 wood-texture">
            <h2 className="text-2xl font-bold text-wood-dark mb-6">
              رویدادها ({events.length})
            </h2>

            {loading ? (
              <p className="text-center">در حال بارگذاری...</p>
            ) : (
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 gap-4" : "space-y-4"}>
                {events.map((event) => (
                  <div key={event.id} className="p-4 border-2 border-wood-light/40 rounded-lg">
                    <h3 className="text-xl font-bold text-wood-dark">{event.title}</h3>
                    <p className="text-wood-medium">{new Date(event.date_time).toLocaleString("fa-IR")}</p>
                    <p className="text-wood-medium">{event.location}</p>

                    <div className="flex gap-2 mt-4">
                      <Button onClick={() => handleEditEvent(event)} className="bg-blue-600 text-white">
                        ویرایش
                      </Button>
                      <Button onClick={() => handleDeleteEvent(event.id)} className="bg-red-600 text-white">
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}

/* -------------------------
   SMALL REUSABLE BLOCKS
-------------------------- */
function InputBlock({ label, value, onChange, type = "text" }: any) {
  return (
    <div>
      <Label className="text-wood-dark font-bold mb-2 block">{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function TextareaBlock({ label, value, onChange }: any) {
  return (
    <div>
      <Label className="text-wood-dark font-bold mb-2 block">{label}</Label>
      <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
