import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

// Photos (Unsplash, royalty-free)
import heroImg from '@/assets/photos/hero.jpg'
import shelterImg from '@/assets/photos/shelter.jpg'
import educationImg from '@/assets/photos/education.jpg'
import communityImg from '@/assets/photos/community.jpg'

/* ---------- "How We Help" cards ---------- */
const howWeHelp = [
  {
    image: shelterImg,
    title: 'Safe Housing',
    description:
      'We operate 9 safe homes across the Philippines where survivors find shelter, stability, and the space to begin healing.',
  },
  {
    image: educationImg,
    title: 'Education & Growth',
    description:
      'From literacy programs to vocational training, every girl receives a personalized education plan to help her build a future.',
  },
  {
    image: communityImg,
    title: 'Community & Support',
    description:
      'Volunteers, partners, and donors come together to surround each girl with the care and encouragement she needs.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ===== HERO (photo background) ===== */}
        <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center">
          {/* Background image */}
          <img
            src={heroImg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug">
                Every girl deserves a safe place to heal
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/85">
                In the Philippines, thousands of young girls are survivors of
                trafficking and abuse. SafeHarbor gives them a home, an
                education, and a path back to the life they deserve.
              </p>
              <div className="mt-8">
                <Link
                  to="/impact"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
                >
                  See How We Help
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== MISSION STATEMENT ===== */}
        <section className="bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
              We walk alongside survivors on their journey from crisis to a
              confident, independent future.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              SafeHarbor operates safe homes across Luzon, Visayas, and Mindanao
              for young girls who have experienced trafficking, abuse, and
              neglect. Through holistic case management -- counseling, health
              care, education, and family reintegration -- we help each girl
              rebuild her life on her own terms.
            </p>
          </div>
        </section>

        {/* ===== HOW WE HELP (photo cards) ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-xl font-semibold text-foreground text-center mb-10">
              How We Help
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howWeHelp.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow border border-border"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-base font-semibold text-card-foreground">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== IMPACT NUMBERS (human, flowing) ===== */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
              <div>
                <p className="text-4xl font-bold text-primary">9</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  safe homes across 3 regions of the Philippines
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">60+</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  girls on their journey to healing and independence
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">180+</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  personalized care plans guiding each girl's recovery
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-primary/10">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              You can be part of their story
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Whether through giving, volunteering, or simply spreading the
              word, your support helps a young girl find safety, hope, and a
              future she can call her own.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Get Involved
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
