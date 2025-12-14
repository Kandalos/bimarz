import Link from "next/link"

const partners = [
  {
    name: "کتابافون ",
    logo: "/ketabafon.jpg",
    url: "https://example.com",
  },
  {
    name: " نوبه ",
    logo: "/nobeh.jpg",
    url: "https://example.com",
  },
    {
    name: " awa ",
    logo: "/awa.png",
    url: "https://example.com",
  },
  {
    name: " Instagram ",
    logo: "/ig.png",
    url: "https://example.com",
  },
  {
    name: " Youtube ",
    logo: "/yt.png",
    url: "https://example.com",
  },

]

export function PartnershipSection() {
  return (
    <section className="py-24 px-6 bg-wood-light/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-balance text-wood-dark">
            رسانه های ما
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
اینجا می‌توانید برنامه‌های یوتیوب و پادکست‌های ما را بشنوید          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-8">
          {partners.map((partner, index) => (
            <Link
              key={index}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-lg border-2 border-wood-light/40 p-6 wood-texture hover:border-wood-medium transition-all hover:shadow-lg flex items-center justify-center"
            >
              <img
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                className="w-full h-auto object-contain transition-all opacity-70 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
