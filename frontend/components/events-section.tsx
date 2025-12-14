"use client"

import { useEffect, useState } from "react"
import { Calendar, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import apiService from "@/lib/apiService"

// --------------------
// Types
// --------------------
type Event = {
  id: number
  title: string
  description: string
  date_time: string
  location: string
  image: string | null
  is_public: boolean
}

// --------------------
// Helpers
// --------------------
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  })

// --------------------
// Component
// --------------------
export function EventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiService.get("/v1/events/")
        setEvents(res.data.filter((e: Event) => e.is_public))
      } catch (err) {
        console.error("Fetch events failed:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <section id="events" className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            رویدادها و اطلاعیه‌ها
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            از جدیدترین رویدادهای ادبی و فرهنگی ما مطلع شوید
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-muted-foreground">
            در حال بارگذاری رویدادها...
          </p>
        )}

        {/* Empty */}
        {!loading && events.length === 0 && (
          <p className="text-center text-muted-foreground">
            رویدادی در حال حاضر وجود ندارد
          </p>
        )}

        {/* Events */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="group relative bg-card rounded-lg overflow-hidden border-2 border-wood-medium/20 hover:border-wood-dark/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 wood-texture"
            >
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wood-dark/60 to-transparent"></div>
              </div>

              {/* Decorative Border */}
              <div className="absolute inset-0 border-4 border-wood-medium/10 rounded-lg pointer-events-none"></div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-4 group-hover:text-wood-dark transition-colors">
                  {event.title}
                </h3>

                <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-wood-dark" />
                    <span>{formatDate(event.date_time)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-wood-dark" />
                    <span>{formatTime(event.date_time)}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-wood-dark" />
                    <span>{event.location}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {event.description}
                </p>

                <Button
                  variant="outline"
                  className="w-full border-wood-medium hover:bg-wood-dark hover:text-white transition-all duration-300 bg-transparent"
                >
                  ثبت‌نام در رویداد
                </Button>
              </div>

              {/* Decorative Corners */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-wood-medium/30 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-wood-medium/30 rounded-bl-lg"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-wood-dark hover:bg-wood-dark/90 text-white px-8 py-6 text-lg">
            مشاهده همه رویدادها
          </Button>
        </div>
      </div>
    </section>
  )
}
