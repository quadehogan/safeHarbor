import { Link } from 'react-router-dom'
import { ArrowRight, Home, BookOpen, HeartPulse, Users } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

import shelterImg from '@/assets/photos/shelter.jpg'
import educationImg from '@/assets/photos/education.jpg'
import communityImg from '@/assets/photos/community.jpg'
import healthImg from '@/assets/photos/health.jpg'

const pillars = [
  {
    icon: Home,
    image: shelterImg,
    title: 'Safe Shelter',
    description:
      'We operate 9 safe homes across Luzon, Visayas, and Mindanao — providing a stable, nurturing environment where girls can begin to heal.',
  },
  {
    icon: BookOpen,
    image: educationImg,
    title: 'Education & Growth',
    description:
      'Every resident receives a personalized education plan — from bridge programs and literacy support to secondary schooling and vocational training.',
  },
  {
    icon: HeartPulse,
    image: healthImg,
    title: 'Health & Wellbeing',
    description:
      'Regular medical, dental, and psychological checkups ensure each girl is cared for holistically — body and mind — throughout her stay.',
  },
  {
    icon: Users,
    image: communityImg,
    title: 'Reintegration',
    description:
      'Through home visitations, family counseling, and careful planning, we guide each girl toward a safe, independent future — whether through family reunification, foster care, or independent living.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ===== HERO BANNER ===== */}
        <section className="bg-muted/60 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              About SafeHarbor
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A safe place for every survivor to heal, grow, and build a future
              on her own terms.
            </p>
          </div>
        </section>

        {/* ===== OUR STORY ===== */}
        <section className="bg-background">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
              Our Story
            </h2>
            <p className="mt-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
              In the Philippines, thousands of young girls are survivors of
              trafficking, abuse, abandonment, and neglect. Many have nowhere
              safe to go. SafeHarbor was founded to change that — to give every
              girl a home, a community, and the tools she needs to rebuild her
              life.
            </p>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Modeled after Lighthouse Sanctuary, a US-based 501(c)(3) that has
              operated safe homes in the Philippines for years, SafeHarbor
              extends that mission to new underserved regions. We take a holistic
              approach: every girl who enters our care receives shelter,
              counseling, education, healthcare, and a personalized plan for
              reintegration into society.
            </p>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Our dedicated social workers walk alongside each resident from the
              day she arrives through her transition to an independent, confident
              future. We believe that with the right support, every girl can
              heal.
            </p>
          </div>
        </section>

        {/* ===== WHAT WE DO ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-xl font-semibold text-foreground text-center mb-10">
              What We Do
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow border border-border"
                >
                  {pillar.image ? (
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="h-40 w-full bg-primary/10 flex items-center justify-center">
                      <pillar.icon className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <pillar.icon className="h-4 w-4 text-primary" />
                      <h3 className="text-base font-semibold text-card-foreground">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-primary/10">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Join us in making a difference
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Every donation, every volunteer hour, and every shared story brings
              a girl one step closer to safety and independence.
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
                to="/impact"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                View Our Impact
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
