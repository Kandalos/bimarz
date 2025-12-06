"use client";

import { useState } from "react";
import apiService from "@/lib/apiService";
import { useRouter } from "next/navigation";

// UI Components
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { LogIn, Mail, Lock } from "lucide-react";

import { useAuth } from "@/components/useAuth";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const { login } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ---------------------------------------------------------
  // 🔐 CORRECT LOGIN HANDLER
  // Django SimpleJWT login endpoint is:
  // POST /api/token/
  // ---------------------------------------------------------
  const handleLogin = async () => {
    setLoading(true);
    setApiError(null);

    try {
      const response = await apiService.post("/token/", {
        email: formData.email, // Django uses `email` as USERNAME_FIELD
        password: formData.password,
      });

      const { access, refresh } = response.data;

      // 🔥 Save tokens globally
      login(access, refresh);

      router.push("/");
    } catch (err: any) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      let errorMessage = "ورود ناموفق. لطفاً اطلاعات را بررسی کنید.";

      if (status === 400 || status === 401) {
        errorMessage = detail || "ایمیل یا رمز عبور اشتباه است.";
      } else if (status === 404) {
        errorMessage =
          "خطا: مسیر ورود پیدا نشد. مسیر صحیح: /api/token/";
      } else {
        errorMessage = "خطای ناشناخته در ارتباط با سرور.";
      }

      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <main className="min-h-screen bg-background relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage:
            "url('/cozy-bookshop-interior-with-wooden-shelves-and-boo.jpg')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/95" />

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 py-24">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-wood-light/40 shadow-xl wood-texture backdrop-blur-sm bg-card/95">
              <CardHeader className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-wood-light/20 rounded-full flex items-center justify-center mb-2">
                  <LogIn className="w-8 h-8 text-wood-medium" />
                </div>
                <CardTitle className="text-3xl font-bold text-wood-dark">
                  ورود
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  برای ورود به حساب کاربری خود اطلاعات را وارد کنید
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-wood-dark font-medium"
                    >
                      ایمیل
                    </Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            email: e.target.value,
                          })
                        }
                        className="pr-10 border-wood-light/60 focus:border-wood-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-wood-dark font-medium"
                      >
                        رمز عبور
                      </Label>
                      <Link
                        href="/forgot-password"
                        className="text-sm text-wood-medium hover:text-wood-dark"
                      >
                        فراموشی رمز عبور؟
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-medium" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="رمز عبور خود را وارد کنید"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="pr-10 border-wood-light/60 focus:border-wood-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          rememberMe: checked as boolean,
                        })
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      مرا به خاطر بسپار
                    </Label>
                  </div>

                  {/* Errors */}
                  {apiError && (
                    <p className="text-sm text-red-500 text-center font-medium mt-2 p-2 border border-red-200 rounded">
                      {apiError}
                    </p>
                  )}

                  {/* Login Button */}
                  <Button
                    type="submit"
                    className="w-full bg-wood-medium hover:bg-wood-dark text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      "در حال ورود..."
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 ml-2" />
                        ورود
                      </>
                    )}
                  </Button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-wood-light/40" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-card px-4 text-muted-foreground">
                        یا
                      </span>
                    </div>
                  </div>

                  {/* Register Link */}
                  <div className="text-center text-sm text-muted-foreground">
                    حساب کاربری ندارید؟{" "}
                    <Link
                      href="/register"
                      className="text-wood-medium hover:text-wood-dark font-medium"
                    >
                      ثبت‌نام کنید
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
  );
}
