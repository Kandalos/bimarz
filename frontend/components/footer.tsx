export function Footer() {
  const navLinks = [
    { href: "/", label: "خانه" },
    { href: "/shop", label: "کتاب‌ها" },
    { href: "/writers", label: "نویسندگان" },
    { href: "/about", label: "درباره ما" },
    { href: "/contact", label: "تماس با ما" },
  ]

  return (
    <footer className="relative mt-20 overflow-hidden">
      {/* Brick background */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: "url('/brick-wall.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2c1810]/95 via-[#3d2415]/90 to-[#4a2f1f]/85" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and description */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <img src="/bimarz.svg" alt="Logo" className="w-16 h-16" />
              <span className="text-2xl font-bold text-wood-light">نشر بی‌مرز</span>
            </div>
            <p className="text-wood-light/80 text-center md:text-right leading-relaxed">
              ناشر کتاب‌های ادبی و فرهنگی با بیش از ۲۰ سال تجربه در صنعت نشر
            </p>
          </div>

          {/* Navigation links */}
          <div className="flex flex-col items-center">
            <h3 className="text-xl font-bold text-wood-light mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-wood-light/80 hover:text-wood-light transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social media */}
          <div className="flex flex-col items-center md:items-end">
            <h3 className="text-xl font-bold text-wood-light mb-4">شبکه‌های اجتماعی</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wood-light/80 hover:text-wood-light transition-colors"
              >
                <i className="lni lni-instagram text-3xl" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wood-light/80 hover:text-wood-light transition-colors"
              >
                <i className="lni lni-youtube text-3xl" />
              </a>
            </div>
          </div>
        </div>

        {/* License and copyright */}
        <div className="border-t border-wood-light/20 pt-6 mt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/license-logo.jpg" alt="License" className="w-8 h-8 opacity-80" />
              <p className="text-wood-light/70 text-sm">تمامی حقوق محفوظ است © {new Date().getFullYear()}</p>
            </div>
            <p className="text-wood-light/70 text-sm">طراحی و توسعه با ❤️ توسط نشر بی‌مرز</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
