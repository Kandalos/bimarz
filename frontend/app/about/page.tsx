import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wood-light via-[#F5E6D3] to-wood-light">
      <Navbar />

      {/* Hero */}
    <section className="relative pt-32 pb-24 px-6">
  {/* Image */}
  <img
    src="/bimarzbookpub.jpg"
    alt=""
    className="absolute inset-0 w-full h-full object-contain bg-wood-dark"
  />

  {/* Overlay */}
  <div className="absolute inset-0 bg-wood-dark/80" />

  {/* Content */}
  <div className="relative z-10 max-w-4xl mx-auto text-center">
    <img
      src="/bimarz.svg"
      alt="نشر بی‌مرز"
      className="w-28 h-28 mx-auto mb-8 filter brightness-0 invert opacity-90"
    />

    <h1 className="text-5xl md:text-6xl font-bold text-wood-light mb-6">
      درباره‌ی نشر بی‌مرز
    </h1>

    <p className="text-xl md:text-2xl text-wood-light/90 leading-relaxed max-w-3xl mx-auto">
      ادبیات بدون مرز — نه به‌عنوان شعار،  
      بلکه به‌عنوان امکان واقعی انتشار
    </p>
  </div>
</section>


      {/* Story */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto wood-texture bg-wood-light/60 rounded-2xl p-10 md:p-14 border-4 border-wood-medium/40 shadow-2xl">
          <p className="text-lg md:text-xl text-wood-dark/85 leading-relaxed mb-6">
            «انتشارات بی‌مرز» از تجربه‌ی ما در دل کافه‌کتاب شالپلاته شکل گرفت؛  
            جایی با هزاران کتاب از ناشران داخل و خارج ایران،  
            و سال‌ها گفت‌وگو با نویسنده‌ها، هنرمندها و خواننده‌ها.
          </p>

          <p className="text-lg md:text-xl text-wood-dark/85 leading-relaxed mb-6">
            همان‌جا، در گفت‌وگوهای رودررو، کم‌کم روشن شد چه نیازهایی در فضای نشر
            بیرون از ایران وجود دارد —  
            و چه صداهایی هستند که هنوز هیچ جایی برای شنیده‌شدن ندارند.
          </p>

          <p className="text-lg md:text-xl text-wood-dark/85 leading-relaxed">
            بی‌مرز از یک تصمیم بزرگ متولد نشد.  
            راهی بود که از قبل شروع شده بود.
          </p>
        </div>
      </section>

      {/* Position */}
     <section
  className="relative py-20 px-6 bg-cover bg-center"
  style={{
    backgroundImage: "url('/freedom.jpg')",
  }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-wood-light/80" />

  <div className="relative z-10 max-w-4xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-bold text-wood-dark mb-10 text-center">
      بی‌مرز یعنی چه؟
    </h2>

    <div className="space-y-8 text-lg md:text-xl text-wood-dark leading-relaxed">
      <p>
        ما یک انتشارات مستقل هستیم که پیش از هر چیز،
        خودمان را رابطی واقعی بین نویسنده و خواننده می‌دانیم.
      </p>

      <p>
        بی‌مرز برای نویسندگانی است که در مهاجرت یا تبعیدند
        و مسیر نشر برایشان بسته بوده —
        و به همان اندازه برای نویسندگان داخل ایران
        که آثارشان با سانسور روبه‌رو شده
        یا تجربه‌ی خوبی از همکاری با ناشران رسمی نداشته‌اند.
      </p>

      <p>
        هدف ما ادبیات بدون مرز است؛  
        نه در شکل یک شعار،
        بلکه در شکل فراهم‌کردن امکان واقعی انتشار،
        به‌دور از محدودیت‌های سیاسی و جغرافیایی.
      </p>
    </div>
  </div>
</section>

      {/* CTA */}
      <section className="py-20 px-6 bg-wood-medium/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-wood-dark mb-6">
            اگر فکر می‌کنید کتاب‌تان باید دیده شود
          </h2>

          <p className="text-xl text-wood-dark/70 mb-8 leading-relaxed">
            یا اگر می‌خواهید ادبیات مستقل و بدون سانسور را دنبال کنید،
            بی‌مرز جایی‌ست برای ارتباط مستقیم.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/contact"
              className="px-8 py-4 bg-wood-dark text-wood-light rounded-lg font-bold hover:bg-wood-medium transition-colors shadow-lg"
            >
              ارتباط با بی‌مرز
            </a>

            <a
              href="/shop"
              className="px-8 py-4 bg-wood-light text-wood-dark rounded-lg font-bold border-3 border-wood-dark hover:bg-wood-medium/20 transition-colors shadow-lg"
            >
              دیدن کتاب‌ها
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
