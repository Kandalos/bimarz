import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-wood-light">
      <Navbar />

      {/* Hero */}
      <section
        className="relative pt-32 pb-24 px-6"
        style={{
          backgroundImage: "url('/cafeshh.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-wood-dark/75" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-wood-light mb-6">
            تماس با ما
          </h1>
        </div>
      </section>

      {/* Content */}
      <section
        className="relative py-20 px-6"
        style={{
          backgroundImage: "url('/images/contact/paper.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-wood-light/80 backdrop-blur-sm" />
          
        <div className="relative z-10 max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

            <div className="relative inline-block">
  {/* SVG Background */}
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 0.6 }}
    aria-hidden
  >
    <defs>
      <pattern
        id="brickPatternLogo"
        x="0"
        y="0"
        width="96"
        height="48"
        patternUnits="userSpaceOnUse"
      >
        <rect x="0" y="0" width="45" height="21" fill="#8B4513" stroke="#654321" strokeWidth="0.5" />
        <rect x="48" y="0" width="45" height="21" fill="#A0522D" stroke="#654321" strokeWidth="0.5" />
        <rect x="-24" y="24" width="45" height="21" fill="#D2691E" stroke="#654321" strokeWidth="0.5" />
        <rect x="24" y="24" width="45" height="21" fill="#CD853F" stroke="#654321" strokeWidth="0.5" />
        <rect x="72" y="24" width="45" height="21" fill="#8B4513" stroke="#654321" strokeWidth="0.5" />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#brickPatternLogo)" />
  </svg>

  {/* Logo with padding */}
  <img
    src="/logo.svg"
    alt="نشر بی‌مرز"
    className="relative z-10 block p-4"
  />
</div>


          <div className="space-y-8">
            {/* Info */}
            <div className="wood-texture bg-wood-light/60 rounded-2xl p-8 border-4 border-wood-medium/40 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-dark mb-6">
                اطلاعات تماس
              </h2>

              <div className="space-y-6 text-wood-dark/80">
                <div className="flex gap-4">
                  <MapPin className="w-6 h-6 text-wood-medium shrink-0" />
                  <p>
                    Café Schallplatte  
                    <br />
                    Scheidtweilerstr. 9  
                    <br />
                    50933 Cologne
                  </p>
                </div>

                <div className="flex gap-4">
                  <Phone className="w-6 h-6 text-wood-medium shrink-0" />
                  <div dir="ltr">
                    <p>+49 221 42305824</p>
                    <p>+49 173 8779093</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Mail className="w-6 h-6 text-wood-medium shrink-0" />
                  <div>
                    <p>info@nashrbimarz.com</p>
                    <p>support@nashrbimarz.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="wood-texture bg-wood-light/60 rounded-2xl p-8 border-4 border-wood-medium/40 shadow-xl">
              <h2 className="text-2xl font-bold text-wood-dark mb-4">
                ساعات کاری
              </h2>

              <div className="space-y-3 text-wood-dark/80">
                <p>دوشنبه تا شنبه: ۱۰:۰۰ – ۱۹:۰۰</p>
                <p>یکشنبه: با هماهنگی قبلی</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
