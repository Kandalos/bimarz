"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Search, ShoppingCart, User } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/", label: "خانه" },
    { href: "/shop", label: "کتاب‌ها" },
    { href: "/writers", label: "نویسندگان" },
    { href: "/cafe", label: "کافه" },
    { href: "/about", label: "درباره ما" },
    { href: "/contact", label: "تماس با ما" },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 wood-texture ${
        isScrolled
          ? "bg-wood-light/95 backdrop-blur-md shadow-lg border-b-2 border-wood-medium/30"
          : "bg-wood-light/80 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-wood-dark hover:text-wood-medium transition-colors font-bold"
          >
            <img src="/bimarz.svg" alt="Logo" className="w-10 h-10" />
            <span className="font-bold text-lg">نشر بی‌مرز</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center max-w-2xl mx-8">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-wood-dark/80 hover:text-wood-dark transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-wood-medium transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="جستجو..."
                className="w-full px-4 py-2 pr-10 rounded-lg border-2 border-wood-medium/30 bg-wood-light/50 text-wood-dark placeholder:text-wood-dark/50 focus:outline-none focus:border-wood-dark transition-colors"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-dark/50" />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="text-wood-dark hover:text-wood-medium transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            <Link
              href="/profile"
              className="text-wood-dark hover:text-wood-medium transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-wood-dark hover:text-wood-medium transition-colors">
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
