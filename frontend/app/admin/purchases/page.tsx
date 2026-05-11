"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import {
  ArrowRight, Package, User, Calendar, DollarSign,
  Search, RefreshCw, ChevronDown, ChevronUp, Loader2,
  AlertCircle, CheckCircle2, MapPin, Mail, Phone, Hash,
} from "lucide-react"
import apiService from "@/lib/apiService"

// ─────────────────────────────────────────────────────────
// Types (mirror backend OrderSerializer / OrderItemSerializer)
// ─────────────────────────────────────────────────────────
type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"

type OrderItem = {
  id: number
  book_id: number
  title_snapshot: string
  price_snapshot: string
  quantity: number
}

type Order = {
  id: string
  order_number: string
  user: number
  user_email: string
  status: OrderStatus
  currency: string
  subtotal: string
  shipping_fee: string
  discount_amount: string
  total_amount: string
  email_snapshot: string
  phone_snapshot: string
  address_snapshot: string
  postal_code_snapshot: string
  location_snapshot: string
  created_at: string
  paid_at: string | null
  items: OrderItem[]
}

// ─────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────
type StatusMeta = {
  label: string
  color: string
  bg: string
}

const STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending_payment: { label: "در انتظار پرداخت", color: "text-yellow-700", bg: "bg-yellow-100 border-yellow-300" },
  paid:            { label: "پرداخت شده",        color: "text-blue-700",   bg: "bg-blue-100 border-blue-300"   },
  processing:      { label: "در حال پردازش",      color: "text-indigo-700", bg: "bg-indigo-100 border-indigo-300" },
  shipped:         { label: "ارسال شده",           color: "text-purple-700", bg: "bg-purple-100 border-purple-300" },
  delivered:       { label: "تحویل داده شده",      color: "text-green-700",  bg: "bg-green-100 border-green-300"  },
  cancelled:       { label: "لغو شده",             color: "text-red-700",    bg: "bg-red-100 border-red-300"      },
}

// What transitions each status allows (mirrors backend ALLOWED_ADMIN_TRANSITIONS)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid:            ["processing", "cancelled"],
  processing:      ["shipped", "cancelled"],
  shipped:         ["delivered"],
  delivered:       [],
  cancelled:       [],
}

const ALL_STATUSES = Object.keys(STATUS_META) as OrderStatus[]

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────
function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function formatPrice(val: string | number, currency = "EUR") {
  const n = Number(val)
  if (isNaN(n)) return val
  return `€${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status] ?? { label: status, color: "text-gray-700", bg: "bg-gray-100 border-gray-300" }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.color}`}>
      {meta.label}
    </span>
  )
}

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-medium transition-all
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      {message}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────
export default function AdminPurchasesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // ── Fetch orders ──────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (statusFilter) params.status = statusFilter
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const res = await apiService.get("/orders/admin/orders/", { params })
      setOrders(res.data)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "خطا در دریافت سفارشات"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // ── Status update ─────────────────────────────────────
  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId)
    try {
      const res = await apiService.patch(`/orders/admin/orders/${orderId}/status/`, {
        status: newStatus,
      })
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o))
      showToast(`وضعیت سفارش به «${STATUS_META[newStatus]?.label}» تغییر یافت`, "success")
    } catch (err: any) {
      const msg = err?.response?.data?.error || "خطا در به‌روزرسانی وضعیت"
      showToast(msg, "error")
    } finally {
      setUpdatingId(null)
    }
  }

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Statistics ────────────────────────────────────────
  const stats = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length
    return acc
  }, {} as Record<OrderStatus, number>)

  const totalRevenue = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0)

  // ─────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="mb-10 space-y-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-wood-dark">مدیریت سفارشات</h1>
            <p className="text-wood-medium text-lg">پیگیری و مدیریت خریدهای مشتریان</p>
            <div className="flex justify-center mt-4">
              <Link href="/admin">
                <Button variant="outline" size="lg"
                  className="border-2 border-wood-dark hover:bg-wood-dark hover:text-white bg-transparent text-wood-dark font-semibold px-8 transition-all">
                  <ArrowRight className="w-5 h-5 ml-2" />
                  بازگشت به پنل اصلی
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="کل سفارشات" value={orders.length} color="text-wood-dark" />
            <StatCard label="در انتظار / پرداخت‌شده" value={stats.pending_payment + stats.paid} color="text-yellow-600" />
            <StatCard label="در حال پردازش / ارسال" value={stats.processing + stats.shipped} color="text-blue-600" />
            <StatCard label="تحویل‌شده" value={stats.delivered} color="text-green-600" />
          </div>

          {/* Revenue summary */}
          <Card className="border-2 border-wood-light/40 wood-texture mb-8">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="flex items-center gap-2 text-wood-medium font-medium">
                  <DollarSign className="w-5 h-5" />
                  درآمد کل (غیر لغوشده)
                </span>
                <span className="text-2xl font-bold text-green-700">{formatPrice(totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* ── Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجو بر اساس شماره سفارش یا ایمیل..."
                className="pr-9 text-right"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchOrders()}
              />
            </div>

            <select
              className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as OrderStatus | "")}
            >
              <option value="">همه وضعیت‌ها</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>

            <Button variant="outline" onClick={fetchOrders} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              بروزرسانی
            </Button>
          </div>

          {/* ── Content ── */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchOrders} />
          ) : orders.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expandedId === order.id}
                  onToggle={() => setExpandedId(prev => prev === order.id ? null : order.id)}
                  onStatusUpdate={handleStatusUpdate}
                  isUpdating={updatingId === order.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
      <Footer />
    </main>
  )
}

// ─────────────────────────────────────────────────────────
// Order Card
// ─────────────────────────────────────────────────────────
function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusUpdate,
  isUpdating,
}: {
  order: Order
  expanded: boolean
  onToggle: () => void
  onStatusUpdate: (id: string, status: OrderStatus) => void
  isUpdating: boolean
}) {
  const allowedNext = ALLOWED_TRANSITIONS[order.status] ?? []

  return (
    <Card className="border-2 border-wood-light/40 wood-texture overflow-hidden">
      {/* ── Summary row ── */}
      <CardHeader
        className="cursor-pointer select-none hover:bg-wood-light/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-wood-dark text-lg">
                سفارش #{order.order_number}
              </CardTitle>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(order.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {order.user_email || order.email_snapshot}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                {order.items.length} قلم
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left">
              <p className="text-xl font-bold text-wood-dark">{formatPrice(order.total_amount)}</p>
              {Number(order.discount_amount) > 0 && (
                <p className="text-xs text-green-600">تخفیف: {formatPrice(order.discount_amount)}</p>
              )}
            </div>
            {expanded ? <ChevronUp className="w-5 h-5 text-wood-medium" /> : <ChevronDown className="w-5 h-5 text-wood-medium" />}
          </div>
        </div>
      </CardHeader>

      {/* ── Expanded detail ── */}
      {expanded && (
        <CardContent className="border-t border-wood-light/30 pt-4 space-y-5">

          {/* Items table */}
          <div>
            <h3 className="font-bold text-wood-dark mb-3 text-sm uppercase tracking-wide">اقلام سفارش</h3>
            <div className="rounded-lg overflow-hidden border border-wood-light/30">
              <table className="w-full text-sm">
                <thead className="bg-wood-light/20">
                  <tr>
                    <th className="text-right px-3 py-2 text-wood-dark font-medium">عنوان کتاب</th>
                    <th className="text-center px-3 py-2 text-wood-dark font-medium">تعداد</th>
                    <th className="text-left px-3 py-2 text-wood-dark font-medium">قیمت واحد</th>
                    <th className="text-left px-3 py-2 text-wood-dark font-medium">جمع</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-t border-wood-light/20 hover:bg-wood-light/5">
                      <td className="px-3 py-2 text-wood-dark">{item.title_snapshot}</td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-left">{formatPrice(item.price_snapshot)}</td>
                      <td className="px-3 py-2 text-left font-medium">
                        {formatPrice(Number(item.price_snapshot) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="flex justify-end">
            <div className="text-sm space-y-1 min-w-[220px]">
              <div className="flex justify-between text-muted-foreground">
                <span>جمع کالاها:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>هزینه ارسال:</span>
                <span>{formatPrice(order.shipping_fee)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>تخفیف:</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-wood-dark border-t border-wood-light/40 pt-1">
                <span>مجموع:</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping info */}
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <InfoBlock icon={<User className="w-4 h-4" />} label="اطلاعات مشتری">
              <p>{order.user_email || order.email_snapshot}</p>
              {order.phone_snapshot && <p className="flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{order.phone_snapshot}</p>}
            </InfoBlock>
            <InfoBlock icon={<MapPin className="w-4 h-4" />} label="آدرس ارسال">
              {order.location_snapshot && <p className="font-medium">{order.location_snapshot}</p>}
              {order.address_snapshot && <p className="text-muted-foreground">{order.address_snapshot}</p>}
              {order.postal_code_snapshot && (
                <p className="flex items-center gap-1 text-muted-foreground mt-1">
                  <Hash className="w-3 h-3" />کد پستی: {order.postal_code_snapshot}
                </p>
              )}
            </InfoBlock>
          </div>

          {order.paid_at && (
            <p className="text-xs text-muted-foreground">
              زمان پرداخت: {formatDate(order.paid_at)}
            </p>
          )}

          {/* Status action buttons */}
          {allowedNext.length > 0 && (
            <div className="pt-2 border-t border-wood-light/30">
              <p className="text-xs text-muted-foreground mb-2">تغییر وضعیت به:</p>
              <div className="flex flex-wrap gap-2">
                {allowedNext.map(nextStatus => (
                  <Button
                    key={nextStatus}
                    size="sm"
                    variant={nextStatus === "cancelled" ? "destructive" : "default"}
                    disabled={isUpdating}
                    onClick={() => onStatusUpdate(order.id, nextStatus)}
                    className={nextStatus !== "cancelled" ? "bg-wood-dark hover:bg-wood-medium text-white" : ""}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" />
                    ) : null}
                    {STATUS_META[nextStatus]?.label ?? nextStatus}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

// ─────────────────────────────────────────────────────────
// Small UI helpers
// ─────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card className="border-2 border-wood-light/40 wood-texture">
      <CardContent className="pt-6 text-center">
        <p className={`text-3xl font-bold mb-1 ${color}`}>{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}

function InfoBlock({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg bg-wood-light/10 space-y-1">
      <p className="flex items-center gap-1.5 font-semibold text-wood-dark text-xs uppercase tracking-wide">
        {icon}{label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <Loader2 className="w-8 h-8 animate-spin" />
      <p>در حال بارگذاری سفارشات...</p>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p className="text-red-600 font-medium">{message}</p>
      <Button variant="outline" onClick={onRetry} className="gap-2">
        <RefreshCw className="w-4 h-4" />
        تلاش مجدد
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
      <Package className="w-12 h-12 opacity-30" />
      <p>هیچ سفارشی یافت نشد</p>
    </div>
  )
}