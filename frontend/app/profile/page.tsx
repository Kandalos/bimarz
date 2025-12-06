"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import apiService from "@/lib/apiService"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Zap, Loader2, Phone, MapPin, Hash, ImagePlus } from "lucide-react"
import { useAuth } from "@/components/useAuth"
import { LogoutButton } from "@/components/LogoutButton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    postal_code: "",
    address: "",
  })

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Redirect if NOT authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        postal_code: user.postal_code || "",
        address: user.address || "",
      })
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-wood-medium" />
      </main>
    )
  }

  if (!user) return null

  const handleSave = async () => {
    setSaving(true)

    try {
      // Handle avatar upload
      if (avatarFile) {
        const form = new FormData()
        form.append("avatar", avatarFile)

        await apiService.patch("v1/core/users/me/", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
      }

      // Handle profile fields
      await apiService.patch("/v1/core/users/me/", formData)

      await refreshUser()
      setIsEditing(false)

    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  return (
    <main className="min-h-screen bg-background relative">
      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 py-24">
          <div className="max-w-xl mx-auto">
            <Card className="border-2 border-wood-light/40 shadow-xl wood-texture backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center space-y-2">
                
                {/* Avatar */}
                <div className="mx-auto w-24 h-24 rounded-full bg-wood-medium/10 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-12 h-12 text-wood-medium" />
                  )}
                </div>

                {/* Avatar Upload Input */}
                {isEditing && (
                  <div className="mt-3">
                    <label className="cursor-pointer text-wood-medium hover:text-wood-dark flex items-center justify-center space-x-2">
                      <ImagePlus className="w-5 h-5" />
                      <span>آپلود آواتار</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarSelect} />
                    </label>
                  </div>
                )}

                <CardTitle className="text-4xl font-extrabold text-wood-dark">
                  {user.first_name} {user.last_name}
                </CardTitle>

                <CardDescription className="text-lg text-muted-foreground">
                  حساب کاربری شما
                </CardDescription>

                <div className="pt-2">
                  <LogoutButton />
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <Separator className="bg-wood-light/50" />

                {/* Editable or read-only content */}
                {!isEditing ? (
                  <div className="space-y-4">

                    {/* Email */}
                    <div className="p-3 bg-wood-light/10 rounded-lg">
                      <p className="text-sm font-medium">ایمیل</p>
                      <p className="text-lg">{user.email}</p>
                    </div>

                    {/* Username */}
                    <div className="p-3 bg-wood-light/10 rounded-lg">
                      <p className="text-sm font-medium">نام کاربری</p>
                      <p className="text-lg">{user.username}</p>
                    </div>

                    {/* Phone */}
                    <div className="p-3 bg-wood-light/10 rounded-lg flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-wood-medium" />
                      <div>
                        <p className="text-sm font-medium">شماره تلفن</p>
                        <p className="text-lg">{user.phone_number || "—"}</p>
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className="p-3 bg-wood-light/10 rounded-lg flex items-center space-x-2">
                      <Hash className="w-5 h-5 text-wood-medium" />
                      <div>
                        <p className="text-sm font-medium">کد پستی</p>
                        <p className="text-lg">{user.postal_code || "—"}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="p-3 bg-wood-light/10 rounded-lg flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-wood-medium" />
                      <div>
                        <p className="text-sm font-medium">آدرس</p>
                        <p className="text-lg">{user.address || "—"}</p>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                      onClick={() => setIsEditing(true)}
                    >
                      ویرایش اطلاعات
                    </Button>

                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* Editable Fields */}
                    <Input id="first_name" value={formData.first_name} onChange={handleChange} placeholder="نام" />
                    <Input id="last_name" value={formData.last_name} onChange={handleChange} placeholder="نام خانوادگی" />
                    <Input id="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="شماره تلفن" />
                    <Input id="postal_code" value={formData.postal_code} onChange={handleChange} placeholder="کد پستی" />
                    <Textarea id="address" value={formData.address} onChange={handleChange} placeholder="آدرس کامل" />

                    <Button
                      className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsEditing(false)}
                    >
                      انصراف
                    </Button>

                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}
