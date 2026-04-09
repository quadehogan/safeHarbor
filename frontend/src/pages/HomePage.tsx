import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Handshake, Globe, Users } from 'lucide-react'
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
      'We operate 9 safe homes across the Philippines where girls in our care find shelter, stability, and the safety to begin healing.',
  },
  {
    image: educationImg,
    title: 'Education & Growth',
    description:
      'From literacy programs to vocational training, every girl receives a personalized education plan — from basic literacy to vocational training — that meets her where she is and helps her grow into who she\'s meant to be.',
  },
  {
    image: communityImg,
    title: 'Community & Support',
    description:
      'Volunteers, partners, and donors come together to surround each girl with the care and encouragement she needs.',
  },
]

/* ---------- Anonymized resident stories ---------- */
const stories = [
  {
    label: 'Resident A',
    text: 'After coming to Safe Harbor at age 14, she enrolled in our Bridge Program. Through counseling and steady support, she is now completing secondary education and preparing for vocational training.',
    status: 'Education In Progress',
  },
  {
    label: 'Resident B',
    text: 'Entered care through a government referral at age 12. After two years of holistic support, she reunified with her family and continues to receive follow-up visits.',
    status: 'Reintegration Completed',
  },
  {
    label: 'Resident C',
    text: 'Came to Safe Harbor at age 15 with critical health needs. With access to regular medical checkups, nutrition support, and counseling, today, with consistent care and support, she is healthy, stable, and thriving.',
    status: 'Health Improving',
  },
]

/* ---------- Scroll fade-in hook ---------- */
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('opacity-100', 'translate-y-0')
          el.classList.remove('opacity-0', 'translate-y-6')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

/* ---------- Reusable fade-in wrapper ---------- */
function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useFadeIn()
  return (
    <div
      ref={ref}
      className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* ===== HERO (photo background) ===== */}
        <section className="relative min-h-[520px] sm:min-h-[600px] flex items-center">
          <img
            src={heroImg}
            alt="Children smiling together at a community center"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-28">
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug">
                Every girl deserves a safe place to heal
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/85">
                In the Philippines, thousands of young girls have experienced
                abuse, neglect, abandonment, or trafficking. Safe Harbor gives them
                a home, an education, and a path toward the future they deserve.
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
        <section className="bg-background">
          <FadeIn className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-snug">
              We walk alongside each girl in our care — from her first day with us
              through her confident, independent future.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Safe Harbor operates safe homes across Luzon, Visayas, and Mindanao
              for young girls who have experienced trafficking, abuse, and
              neglect. Through holistic case management -- counseling, health
              care, education, and family reintegration -- we help each girl
              rebuild her life on her own terms.
            </p>
          </FadeIn>
        </section>

        {/* ===== HOW WE HELP (photo cards) ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-xl font-semibold text-foreground text-center mb-10">
              How We Help
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howWeHelp.map((card, i) => (
                <FadeIn
                  key={card.title}
                  className={`${i === 1 ? 'delay-100' : i === 2 ? 'delay-200' : ''}`}
                >
                  <div className="rounded-xl overflow-hidden bg-card shadow-sm hover:shadow-md transition-shadow border border-border h-full">
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
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== IMPACT NUMBERS ===== */}
        <section className="bg-background">
          <FadeIn className="mx-auto max-w-4xl px-6 lg:px-8 py-16 sm:py-20">
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
                  girls who have called a Safe Harbor home their own
                </p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary">180+</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  care plan milestones reached, guiding each girl toward a confident future
                </p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ===== SOCIAL PROOF / DONOR TRUST ===== */}
        <section className="bg-primary/5 border-y border-primary/10">
          <FadeIn className="mx-auto max-w-5xl px-6 lg:px-8 py-12 sm:py-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <Handshake className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold text-foreground">420+</p>
                <p className="text-sm text-muted-foreground">
                  donations and contributions across all support types
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-sm text-muted-foreground">
                  countries supporting our mission
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold text-foreground">60+</p>
                <p className="text-sm text-muted-foreground">
                  donors, volunteers, and partner organizations
                </p>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ===== RESIDENT STORIES (anonymized) ===== */}
        <section className="bg-muted/30">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn>
              <h2 className="text-xl font-semibold text-foreground text-center mb-3">
                Stories From Our Homes
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-xl mx-auto mb-10">
                Every girl's journey is different. Here are a few glimpses into life at Safe Harbor.
                Names are withheld to protect their privacy.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story, i) => (
                <FadeIn
                  key={story.label}
                  className={`${i === 1 ? 'delay-100' : i === 2 ? 'delay-200' : ''}`}
                >
                  <div className="rounded-xl bg-card border border-border p-6 h-full flex flex-col">
                    <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1 w-fit mb-3">
                      {story.status}
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {story.text}
                    </p>
                    <p className="mt-4 text-xs font-medium text-foreground/60">
                      -- {story.label}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-primary/10">
          <FadeIn className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
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
          </FadeIn>
        </section>
      </main>

      <Footer />
    </div>
  )
}
