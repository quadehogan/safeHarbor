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
  HeartPulse,
  Users,
  TrendingUp,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

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
  { icon: DollarSign, value: '$420K+', label: 'Total Donations' },
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

const educationHealthStats = [
  { value: '85%', label: 'School Enrollment Rate', icon: BookOpen },
  { value: '78%', label: 'Avg. Education Progress', icon: GraduationCap },
  { value: '90%', label: 'Health Checkup Completion', icon: HeartPulse },
  { value: '+18 pts', label: 'Avg. Health Score Improvement', icon: TrendingUp },
]

const donorStats = [
  { value: '$420K+', label: 'Total Donations Received', icon: DollarSign },
  { value: '238', label: 'Unique Donors', icon: Users },
  { value: '18', label: 'Recurring Donors', icon: RefreshCw },
  { value: '12', label: 'Partner Organizations', icon: Handshake },
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
        <section className="bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <FadeIn>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Our Impact
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Real numbers behind the lives we're changing. Every metric
                represents a girl given safety, education, and hope for her future.
              </p>
            </FadeIn>

            {/* Hero stat cards */}
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {heroStats.map((stat, i) => (
                <FadeIn key={stat.label} className={i > 0 ? `delay-${i * 100}` : ''}>
                  <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-center">
                    <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                    <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHERE WE OPERATE ===== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Where We Operate
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                SafeHarbor runs 9 safe homes across 6 regions of the Philippines,
                providing shelter and care where the need is greatest.
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

        {/* ===== RESCUE & REINTEGRATION ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <FadeIn>
                <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary lg:mx-0" />
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                  Rescue & Reintegration
                </h2>
                <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Every girl who enters SafeHarbor's care receives an
                  individualized reintegration plan. Our team of social workers,
                  counselors, and educators work together to guide each girl from
                  crisis toward a confident, independent future — whether that
                  means family reunification, independent living, or continued
                  supported care.
                </p>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  With a 72% successful reintegration rate, SafeHarbor is
                  demonstrating that holistic, long-term care changes lives.
                </p>
              </FadeIn>

              <FadeIn className="delay-100">
                <div className="grid grid-cols-2 gap-4">
                  {reintegrationStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-card border border-border p-5 text-center"
                    >
                      <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                      <p className="text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ===== EDUCATION & HEALTH ===== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Education & Health Outcomes
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Healing goes beyond shelter. We invest in every girl's education
                and health so she can build a future on a strong foundation.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {educationHealthStats.map((stat, i) => (
                <FadeIn key={stat.label} className={i > 0 ? `delay-${i * 75}` : ''}>
                  <div className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow">
                    <div className="mx-auto mb-3 rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== DONOR & PARTNERSHIP IMPACT ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Donor & Partnership Impact
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                None of this would be possible without the generosity of our donors
                and the collaboration of our partner organizations.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {donorStats.map((stat, i) => (
                <FadeIn key={stat.label} className={i > 0 ? `delay-${i * 75}` : ''}>
                  <div className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-md transition-shadow">
                    <div className="mx-auto mb-3 rounded-lg bg-primary/10 w-10 h-10 flex items-center justify-center">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ===== ML INSIGHTS PLACEHOLDER ===== */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Predictive Insights
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Using machine learning, we're building smarter tools to improve
                outcomes for every girl in our care.
              </p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ML Pipeline Placeholder 1 */}
              <FadeIn>
                <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                  <div className="mx-auto mb-4 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Reintegration Success Predictor
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    A predictive model that identifies key factors contributing to
                    successful reintegration, helping social workers prioritize
                    interventions and allocate resources more effectively.
                  </p>
                  <span className="inline-block mt-4 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                    Coming Soon
                  </span>
                </div>
              </FadeIn>

              {/* ML Pipeline Placeholder 2 */}
              <FadeIn className="delay-100">
                <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                  <div className="mx-auto mb-4 rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Donor Retention Forecast
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    An ML-driven model that forecasts donor engagement trends and
                    identifies at-risk supporters, enabling proactive outreach to
                    sustain long-term funding for our programs.
                  </p>
                  <span className="inline-block mt-4 text-xs font-medium text-primary bg-primary/10 rounded-full px-3 py-1">
                    Coming Soon
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-primary/10">
          <FadeIn className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Help us reach even more girls
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Every contribution — big or small — helps provide a safe home, an
              education, and a path to independence for a young girl in the
              Philippines.
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
