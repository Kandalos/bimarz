"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiService from "@/lib/apiService";

interface CheckoutItem {
  id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  cover_image: string | null;
}

interface CheckoutSummary {
  items: CheckoutItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  user_profile_complete: boolean;
  missing_fields?: string[];
}

interface Location {
  id: number;
  name: string;
}

interface UserProfile {
  address: string;
  postal_code: string;
  phone_number: string;
  location: number | null; // location ID
  // other fields not needed for display
}

export default function CheckoutPage() {
  const [summary, setSummary] = useState<CheckoutSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [processing, setProcessing] = useState(false);

  // Profile form state (for incomplete profile)
  const [locations, setLocations] = useState<Location[]>([]);
  const [profileForm, setProfileForm] = useState({
    address: "",
    postal_code: "",
    phone_number: "",
    location: "", // will hold string ID
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  const router = useRouter();

  // Fetch checkout summary
  const fetchSummary = async () => {
    try {
      const res = await apiService.get('/orders/checkout/summary/');
      setSummary(res.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("لطفاً ابتدا وارد شوید");
      } else if (err.response?.status === 400) {
        // Profile incomplete – we get missing_fields
        setSummary(err.response.data);
      } else {
        setError("خطا در دریافت اطلاعات تسویه حساب");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch available locations for dropdown
  const fetchLocations = async () => {
    try {
      const res = await apiService.get('/v1/core/locations/');
      setLocations(res.data);
    } catch (err) {
      console.error("Failed to load locations", err);
    }
  };

  // Fetch current user profile (for pre-filling and display)
  const fetchUserProfile = async () => {
    try {
      const res = await apiService.get('/v1/core/users/me/');
      const user = res.data;
      setCurrentProfile({
        address: user.address || "",
        postal_code: user.postal_code || "",
        phone_number: user.phone_number || "",
        location: user.location,
      });
    } catch (err) {
      console.error("Failed to load user profile", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchLocations();
    fetchUserProfile();
  }, []);

  // Update profile (partial update with PATCH)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      // Only send fields that have values (all are present in form)
      await apiService.patch('/v1/core/users/me/', profileForm);
      // After successful update, refresh summary and user profile
      await fetchSummary();
      await fetchUserProfile();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Proceed to PayPal
  const handlePay = async () => {
    setProcessing(true);
    try {
      const res = await apiService.post('/orders/checkout/', {
        promo_code: promoCode || undefined,
      });
      if (res.data.approval_url) {
        window.location.href = res.data.approval_url;
      } else {
        alert("خطا: آدرس پرداخت دریافت نشد");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "خطا در ایجاد سفارش");
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (value: number) => value.toLocaleString("fa-IR");

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p>در حال بارگذاری...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/cart')}>بازگشت به سبد خرید</Button>
        </div>
        <Footer />
      </main>
    );
  }

  // Show profile completion form if profile is incomplete
  if (summary && !summary.user_profile_complete) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-wood-dark mb-6 text-center">
              تکمیل اطلاعات پروفایل
            </h1>
            <Card className="border-2 border-wood-light/40 wood-texture">
              <CardContent className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {summary.missing_fields?.includes("آدرس") && (
                    <div className="space-y-2">
                      <Label htmlFor="address">آدرس</Label>
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  {summary.missing_fields?.includes("کد پستی") && (
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">کد پستی</Label>
                      <Input
                        id="postal_code"
                        value={profileForm.postal_code}
                        onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  {summary.missing_fields?.includes("شماره تلفن") && (
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">شماره تلفن</Label>
                      <Input
                        id="phone_number"
                        value={profileForm.phone_number}
                        onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  {summary.missing_fields?.includes("کشور/شهر") && (
                    <div className="space-y-2">
                      <Label htmlFor="location">کشور/شهر</Label>
                      <Select
                        value={profileForm.location}
                        onValueChange={(value) => setProfileForm({ ...profileForm, location: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب کنید" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={String(loc.id)}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                  >
                    {updatingProfile ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        در حال ذخیره...
                      </>
                    ) : (
                      "ذخیره و ادامه"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Profile complete – show order summary and payment
  if (!summary) return null; // should not happen

  // Get location name for display
  const locationName = locations.find(l => l.id === currentProfile?.location)?.name || "—";

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-wood-medium hover:text-wood-dark mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>بازگشت به سبد خرید</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-wood-dark mb-8">تسویه حساب</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column: Items + Shipping Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Items Review */}
              <div>
                <h2 className="text-2xl font-bold text-wood-dark mb-4">مرور سفارش</h2>
                <div className="space-y-4">
                  {summary.items.map((item) => (
                    <Card key={item.id} className="border-2 border-wood-light/40 wood-texture">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={
                              item.cover_image
                                ? item.cover_image.startsWith("http")
                                  ? item.cover_image
                                  : `${process.env.NEXT_PUBLIC_API_BASE_URL}${item.cover_image}`
                                : "/placeholder.svg"
                            }
                            alt={item.title}
                            className="w-20 h-28 object-cover rounded border-2 border-wood-light/40"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-wood-dark">{item.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{item.author}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-wood-medium">
                                {item.quantity} × {formatPrice(item.price)} یورو
                              </span>
                              <span className="font-bold text-wood-dark">
                                {formatPrice(item.price * item.quantity)} یورو
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Shipping Information (read-only) */}
              {currentProfile && (
                <Card className="border-2 border-wood-light/40 wood-texture">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-wood-dark">اطلاعات ارسال</CardTitle>
                    <Link href="/profile" className="text-wood-medium hover:text-wood-dark">
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">آدرس:</span>
                      <span className="font-medium text-wood-dark">{currentProfile.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">کد پستی:</span>
                      <span className="font-medium text-wood-dark">{currentProfile.postal_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">تلفن:</span>
                      <span className="font-medium text-wood-dark">{currentProfile.phone_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">کشور/شهر:</span>
                      <span className="font-medium text-wood-dark">{locationName}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column: Summary & Payment */}
            <div className="lg:col-span-1">
              <Card className="border-2 border-wood-light/40 wood-texture sticky top-24">
                <CardHeader>
                  <CardTitle className="text-wood-dark">خلاصه سفارش</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>جمع کل:</span>
                    <span>{formatPrice(summary.subtotal)} یورو</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>هزینه ارسال:</span>
                    <span>{formatPrice(summary.shipping_fee)} یورو</span>
                  </div>
                  <div className="border-t border-wood-light/40 pt-4">
                    <div className="flex justify-between text-xl font-bold text-wood-dark">
                      <span>مجموع:</span>
                      <span>{formatPrice(summary.total)} یورو</span>
                    </div>
                  </div>

                  {/* Promo Code (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="promo">کد تخفیف</Label>
                    <div className="flex gap-2">
                      <Input
                        id="promo"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="کد را وارد کنید"
                        disabled={processing}
                      />
                      <Button variant="outline" onClick={() => alert("اعمال کد تخفیف")}>
                        اعمال
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePay}
                    disabled={processing}
                    className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        در حال اتصال به درگاه...
                      </>
                    ) : (
                      "پرداخت"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}