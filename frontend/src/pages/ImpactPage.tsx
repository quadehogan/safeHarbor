import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  Home,
  Handshake,
  DollarSign,
  MapPin,
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

import shelterImg from '@/assets/photos/shelter.jpg'
import educationImg from '@/assets/photos/education.jpg'
import communityImg from '@/assets/photos/community.jpg'
import healthImg from '@/assets/photos/health.jpg'

/* ------------------------------------------------------------------ */
/*  Scroll fade-in (matches HomePage pattern)                         */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Static data (wire to PublicImpactSnapshot API later)              */
/* ------------------------------------------------------------------ */
const heroStats = [
  { icon: Heart, value: '180+', label: 'Girls Rescued' },
  { icon: Home, value: '9', label: 'Safe Homes' },
  { icon: Handshake, value: '12', label: 'Active Partners' },
  { icon: DollarSign, value: '$420K+', label: 'Total Raised' },
]

const locations = [
  { region: 'Metro Manila', city: 'Quezon City', capacity: 15, occupancy: 13 },
  { region: 'Central Luzon', city: 'Angeles City', capacity: 12, occupancy: 11 },
  { region: 'Western Visayas', city: 'Iloilo City', capacity: 14, occupancy: 12 },
  { region: 'Central Visayas', city: 'Cebu City', capacity: 16, occupancy: 14 },
  { region: 'Davao Region', city: 'Davao City', capacity: 10, occupancy: 8 },
  { region: 'Northern Mindanao', city: 'Cagayan de Oro', capacity: 12, occupancy: 9 },
]

const reintegrationStats = [
  { value: '77', label: 'Girls Currently in Care', icon: ShieldCheck },
  { value: '72%', label: 'Successfully Reintegrated', icon: TrendingUp },
  { value: '38', label: 'In Family Reunification', icon: Users },
  { value: '15', label: 'Living Independently', icon: Sparkles },
]

const educationStats = [
  { value: '85%', label: 'School Enrollment Rate', icon: BookOpen },
  { value: '78%', label: 'Avg. Education Progress', icon: GraduationCap },
  { value: '92%', label: 'Attendance Rate', icon: Users },
  { value: '34', label: 'Vocational Graduates', icon: TrendingUp },
]

const stories = [
  {
    label: 'Resident A',
    age: '16',
    text: 'She arrived frightened and unsure of everything. Today, two years later, she is one of the top students in her class and dreams of becoming a nurse. She says the safe home gave her something she never had before — a routine, people who cared, and the quiet belief that she could be more.',
    status: 'Education In Progress',
    image: educationImg,
  },
  {
    label: 'Resident B',
    age: '14',
    text: 'After being reunified with her grandmother last year, she continues to visit the safe home on weekends for tutoring. Her social worker says she lights up the room. She recently told a new resident, "It gets better. I promise."',
    status: 'Reintegration Complete',
    image: communityImg,
  },
  {
    label: 'Resident C',
    age: '15',
    text: 'When she first came to SafeHarbor, she wouldn\'t speak to anyone for weeks. Through patient counseling and art therapy, she slowly began to open up. Now she leads a small peer support group and helps younger girls feel welcome.',
    status: 'Healing In Progress',
    image: healthImg,
  },
]

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export function ImpactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative min-h-[480px] sm:min-h-[540px] flex items-center">
          <img
            src={shelterImg}
            alt="SafeHarbor shelter in the Philippines"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 w-full">
            <FadeIn>
              <div className="max-w-2xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-snug">
                  The lives behind the numbers
                </h1>
                <p className="mt-4 text-base sm:text-lg text-white/85 leading-relaxed">
                  Every number on this page is a girl who found safety when she
                  needed it most. Here's a look at the impact your support makes
                  possible.
                </p>
              </div>
            </FadeIn>

            {/* Hero stat cards */}
            <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {heroStats.map((stat, i) => (
                <FadeIn key={stat.label} className={i > 0 ? `delay-${i * 100}` : ''}>
                  <div className="rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 p-5 text-center">
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-xs sm:text-sm text-white/70">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHERE WE OPERATE ===== */}
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Where We Are
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Across 6 regions of the Philippines, SafeHarbor operates safe homes
                where girls can begin to heal, learn, and grow at their own pace.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((loc, i) => (
                <FadeIn key={loc.city} className={i > 0 ? `delay-${Math.min(i * 75, 300)}` : ''}>
                  <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-card-foreground">
                          {loc.city}
                        </h3>
                        <p className="text-xs text-muted-foreground">{loc.region}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${(loc.occupancy / loc.capacity) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {loc.occupancy}/{loc.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== RESCUE & REINTEGRATION (image + stats) ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <FadeIn>
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src={communityImg}
                    alt="Girls supported through SafeHarbor's reintegration program"
                    className="w-full h-72 sm:h-80 object-cover"
                  />
                </div>
              </FadeIn>

              <FadeIn className="delay-100">
                <div className="h-1 w-12 rounded-full bg-primary mb-6" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                  Rescue & Reintegration
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Every girl in our care has her own story and her own timeline.
                  Some are working toward reunification with family. Others are
                  building the skills to live on their own. What they share is a
                  community that believes in them — and a plan built around their
                  strengths.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {reintegrationStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-card border border-border p-4 text-center"
                    >
                      <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ===== EDUCATION (stats + image) ===== */}
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <FadeIn>
                <div className="h-1 w-12 rounded-full bg-primary mb-6" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                  Education That Opens Doors
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  For many of our girls, SafeHarbor is the first place they've
                  been able to attend school consistently. From literacy catch-up
                  programs to vocational training, every education plan is
                  personalized — because every girl's starting point is different.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {educationStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-muted/60 border border-border p-4 text-center"
                    >
                      <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn className="delay-100">
                <div className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src={educationImg}
                    alt="Girl studying at a SafeHarbor education program"
                    className="w-full h-72 sm:h-80 object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ===== STORIES ===== */}
        <section className="bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                In Their Own Words
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Names and details have been changed to protect privacy. But these
                are real stories from real girls whose lives are being
                transformed.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.map((story, i) => (
                <FadeIn
                  key={story.label}
                  className={i > 0 ? `delay-${i * 100}` : ''}
                >
                  <div className="rounded-xl bg-card border border-border overflow-hidden h-full flex flex-col">
                    <img
                      src={story.image}
                      alt={story.label}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-block text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                          {story.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Age {story.age}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        "{story.text}"
                      </p>
                      <p className="mt-4 text-xs font-medium text-foreground/50">
                        — {story.label}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FULL-WIDTH IMAGE BREAK ===== */}
        <section className="relative h-64 sm:h-80">
          <img
            src={healthImg}
            alt="Girls at a SafeHarbor community gathering"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex items-center justify-center">
            <FadeIn className="text-center px-6">
              <p className="text-xl sm:text-2xl font-semibold text-white max-w-2xl leading-relaxed">
                "It gets better. I promise."
              </p>
              <p className="mt-2 text-sm text-white/70">
                — A SafeHarbor resident to a newly arrived girl
              </p>
            </FadeIn>
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
              word — your support helps a young girl find safety, hope, and a
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
                Learn About Us
              </Link>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </div>
  )
}
