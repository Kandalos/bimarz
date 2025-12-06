"use client"

import type React from "react"
import { useState, useEffect } from "react" // Import useEffect
import apiService from "@/lib/apiService" 
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea" // For the Address field
import Link from "next/link"
import { UserPlus, Mail, Lock, Phone, MapPin, Hash } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "", // NEW FIELD
    address: "", // NEW FIELD
    postal_code: "", // NEW FIELD
    password: "",
    re_password: "", // Djoser confirmation field
  })
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()
  
  // --- HYDRATION FIX STATE ---
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
      // Set state to true only after component has mounted on the client
      setIsMounted(true);
  }, []);
  // ---------------------------

  const handleRegister = async () => {
    setLoading(true)
    setApiError(null)

    // Basic validation for password match
    if (formData.password !== formData.re_password) {
      setApiError("رمز عبور و تکرار آن مطابقت ندارند.")
      setLoading(false)
      return
    }

    try {
      // Djoser uses 'username', 'email', 'password', 're_password', and other user fields directly
      const userData = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        // Include new fields for registration
        phone_number: formData.phone_number,
        address: formData.address,
        postal_code: formData.postal_code,
        password: formData.password,
        re_password: formData.re_password, 
      }

      // FIX: Using the confirmed path: 'v1/core/users/'
      await apiService.post('/v1/core/register/', userData) 
      
      console.log("ثبت‌نام با موفقیت انجام شد.")
      // Redirect to login page after successful registration
      router.push('/login') 
      
    } catch (err: any) {
      // Detailed error handling for Djoser errors
      let errorMessage = "ثبت نام ناموفق بود. لطفاً اطلاعات وارد شده را بررسی کنید."
      if (err.response?.data) {
          const errorDetails = err.response.data
          // Join error messages from different fields
          const messages = Object.keys(errorDetails).map(key => {
              // Format field names nicely (e.g., 'email' -> 'ایمیل')
              const fieldName = {
                  username: 'نام کاربری', email: 'ایمیل', password: 'رمز عبور', re_password: 'تکرار رمز عبور',
                  first_name: 'نام', last_name: 'نام خانوادگی', phone_number: 'تلفن',
                  address: 'آدرس', postal_code: 'کد پستی'
              }[key] || key
              
              const errorValue = errorDetails[key];

              // Check if errorValue is an array before trying to join it.
              const errorText = Array.isArray(errorValue) 
                  ? errorValue.join(' ')
                  : errorValue.toString();

              // If the key is 'non_field_errors' or similar, we skip the field name prefix.
              if (key === 'non_field_errors' || key === 'detail') {
                  return errorText;
              }

              return `${fieldName}: ${errorText}`;
          })
          errorMessage = messages.join(' | ')
      }
      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleRegister()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [id]: value,
    }));
  };
  
  // If not mounted, render a skeleton to avoid hydration error (prevents CLS)
  if (!isMounted) {
      return (
        <main className="min-h-screen bg-background relative">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
                style={{
                    backgroundImage: "url('/cozy-bookshop-interior-with-wooden-shelves-and-boo.jpg')",
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />

            <div className="relative z-10">
                <Navbar />
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-2xl mx-auto">
                        {/* Skeleton to preserve space and avoid layout shift */}
                        <Card className="border-2 border-wood-light/40 shadow-xl wood-texture backdrop-blur-sm bg-card/95 h-[700px] flex items-center justify-center">
                            <p className="text-xl text-wood-dark/70">در حال بارگذاری فرم ثبت‌نام...</p>
                        </Card>
                    </div>
                </div>
                <Footer />
            </div>
        </main>
      );
  }


  return (
    <main className="min-h-screen bg-background relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('/cozy-bookshop-interior-with-wooden-shelves-and-boo.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-wood-light/40 shadow-xl wood-texture backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-wood-light/20 rounded-full flex items-center justify-center mb-2">
                  <UserPlus className="w-8 h-8 text-wood-medium" />
                </div>
                <CardTitle className="text-3xl font-bold text-wood-dark">ثبت‌نام کاربر جدید</CardTitle>
                <CardDescription className="text-muted-foreground">
                  فرم زیر را برای ایجاد حساب کاربری تکمیل کنید.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Row 1: First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-wood-dark font-medium">نام</Label>
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="نام"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="border-wood-light/60 focus:border-wood-medium"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-wood-dark font-medium">نام خانوادگی</Label>
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="نام خانوادگی"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="border-wood-light/60 focus:border-wood-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Username & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-wood-dark font-medium">نام کاربری</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="نام کاربری"
                        value={formData.username}
                        onChange={handleChange}
                        className="border-wood-light/60 focus:border-wood-medium"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-wood-dark font-medium">ایمیل</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="pr-10 border-wood-light/60 focus:border-wood-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 3: Phone Number & Postal Code (NEW) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number" className="text-wood-dark font-medium">شماره تلفن</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                        <Input
                          id="phone_number"
                          type="tel"
                          placeholder="09123456789"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="pr-10 border-wood-light/60 focus:border-wood-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code" className="text-wood-dark font-medium">کد پستی</Label>
                      <div className="relative">
                        <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                        <Input
                          id="postal_code"
                          type="text"
                          placeholder="1234567890"
                          value={formData.postal_code}
                          onChange={handleChange}
                          className="pr-10 border-wood-light/60 focus:border-wood-medium"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Row 4: Address (NEW) */}
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-wood-dark font-medium">آدرس کامل</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 w-5 h-5 text-wood-medium" />
                      <Textarea
                        id="address"
                        placeholder="آدرس کامل برای ارسال سفارش"
                        value={formData.address}
                        onChange={handleChange}
                        className="pr-10 border-wood-light/60 focus:border-wood-medium min-h-[100px]"
                      />
                    </div>
                  </div>


                  {/* Row 5: Password & Re-Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-wood-dark font-medium">رمز عبور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="رمز عبور"
                          value={formData.password}
                          onChange={handleChange}
                          className="pr-10 border-wood-light/60 focus:border-wood-medium"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="re_password" className="text-wood-dark font-medium">تکرار رمز عبور</Label>
                      <div className="relative">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                        <Input
                          id="re_password"
                          type="password"
                          placeholder="تکرار رمز عبور"
                          value={formData.re_password}
                          onChange={handleChange}
                          className="pr-10 border-wood-light/60 focus:border-wood-medium"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* API Error Display */}
                  {apiError && (
                    <p className="text-sm text-red-500 text-center font-medium mt-2 p-2 border border-red-200 rounded">
                      {apiError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                    disabled={loading}
                  >
                    {loading ? 'در حال ثبت‌نام...' : (
                      <>
                        <UserPlus className="w-5 h-5 ml-2" />
                        ثبت‌نام
                      </>
                    )}
                  </Button>

                  {/* Login Link */}
                  <div className="text-center text-sm text-muted-foreground pt-4">
                  {"  حساب کاربری دارید؟"}
                    <Link href="/login" className="text-wood-medium hover:text-wood-dark font-medium">
                      ورود
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  )
}