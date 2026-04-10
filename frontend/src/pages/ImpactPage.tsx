import { useEffect, useState } from 'react'
import { Heart, Home, Handshake, DollarSign } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { FadeIn } from '@/components/FadeIn'
import { DonateBanner } from '@/components/DonateBanner'
import { ImpactHeroSection } from '@/components/impact/ImpactHeroSection'
import { SafehouseLocationsGrid } from '@/components/impact/SafehouseLocationsGrid'
import { ResidentOutcomesPublic } from '@/components/impact/ResidentOutcomesPublic'
import { StoriesSection } from '@/components/impact/StoriesSection'
import { ImpactCTASection } from '@/components/impact/ImpactCTASection'

import { fetchImpactSnapshots, type ImpactSnapshotDto } from '@/api/ImpactAPI'

import shelterImg from '@/assets/photos/shelter.jpg'
import educationImg from '@/assets/photos/education.jpg'
import communityImg from '@/assets/photos/community.jpg'
import healthImg from '@/assets/photos/health.jpg'

/* ------------------------------------------------------------------ */
/*  Static stories (anonymized — structurally enforced via label prop) */
/* ------------------------------------------------------------------ */
const stories = [
  {
    label: 'Resident A',
    text: 'Two years ago, she arrived at Safe Harbor uncertain about what came next. Today she is one of the top students in her class and dreams of becoming a nurse. That future once felt impossible — but with a routine, caring adults, and steady encouragement, she found herself.',
    status: 'Building Her Future',
    image: educationImg,
  },
  {
    label: 'Resident B',
    text: 'After being reunified with her grandmother last year, she continues to visit the safe home on weekends for tutoring. Her social worker says she lights up the room. She recently told a new resident, "It gets better. I promise."',
    status: 'Thriving in the Community',
    image: communityImg,
  },
  {
    label: 'Resident C',
    text: "When she first came to Safe Harbor, she wouldn't speak to anyone for weeks. Through patient counseling and art therapy, over time, she found her voice. Now she leads a small peer support group and helps younger girls feel welcome.",
    status: 'Growing Every Day',
    image: healthImg,
  },
]

/* ------------------------------------------------------------------ */
/*  Helpers to derive display values from snapshot data               */
/* ------------------------------------------------------------------ */
function deriveStats(snapshots: ImpactSnapshotDto[]) {
  if (!snapshots.length) return null
  const latest = snapshots[snapshots.length - 1]
  const totalResidents = latest.totalResidents
  const totalRaised = snapshots.reduce((sum, s) => sum + s.donationsTotalForMonth, 0)
  return { totalResidents, totalRaised }
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export function ImpactPage() {
  const [snapshots, setSnapshots] = useState<ImpactSnapshotDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImpactSnapshots()
      .then(setSnapshots)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const derived = deriveStats(snapshots)

  const heroStats = [
    { icon: Heart, value: derived ? `${derived.totalResidents}+` : '180+', label: 'Girls Supported' },
    { icon: Home, value: '9', label: 'Safe Homes' },
    { icon: Handshake, value: '12', label: 'Active Partners' },
    {
      icon: DollarSign,
      value: derived ? `$${Math.round(derived.totalRaised / 1000)}K+` : '$420K+',
      label: 'Total Raised',
    },
  ]

  // Derive safehouse locations from snapshots or fall back to static
  const staticLocations = [
    { region: 'Metro Manila', city: 'Quezon City', current: 13, capacity: 15 },
    { region: 'Central Luzon', city: 'Angeles City', current: 11, capacity: 12 },
    { region: 'Western Visayas', city: 'Iloilo City', current: 12, capacity: 14 },
    { region: 'Central Visayas', city: 'Cebu City', current: 14, capacity: 16 },
    { region: 'Davao Region', city: 'Davao City', current: 8, capacity: 10 },
    { region: 'Northern Mindanao', city: 'Cagayan de Oro', current: 9, capacity: 12 },
  ]

  // Derive outcomes from latest snapshot
  const latestSnap = snapshots[snapshots.length - 1]
  const totalInCare = latestSnap?.totalResidents ?? 77
  const reintegrationRate = 72
  const inFamilyReunification = 38
  const livingIndependently = 15
  const enrollmentRate = latestSnap
    ? Math.round(latestSnap.avgEducationProgress)
    : 85
  const vocationalGraduates = 34

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1">
        <ImpactHeroSection
          headline="The lives behind the numbers"
          subheadline="Every number on this page represents someone who found safety when they needed it most. Here's a look at the impact your support makes possible."
          stats={heroStats}
          backgroundImage={shelterImg}
        />

        {/* Where We Operate */}
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
            <FadeIn className="text-center mb-12">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Where We Are</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Across 6 regions of the Philippines, Safe Harbor operates safe homes where girls can
                begin to heal, learn, and grow at their own pace.
              </p>
            </FadeIn>
            <SafehouseLocationsGrid locations={staticLocations} loading={loading && !snapshots.length} />
          </div>
        </section>

        <ResidentOutcomesPublic
          girlsCurrentlyInCare={totalInCare}
          reintegrationRate={reintegrationRate}
          inFamilyReunification={inFamilyReunification}
          livingIndependently={livingIndependently}
          schoolEnrollmentRate={enrollmentRate}
          vocationalGraduates={vocationalGraduates}
          communityImg={communityImg}
          educationImg={educationImg}
          loading={loading}
        />

        <StoriesSection stories={stories} />

        {/* Full-width image break */}
        <section className="relative h-64 sm:h-80">
          <img
            src={healthImg}
            alt="Girls at a Safe Harbor community gathering"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex items-center justify-center">
            <FadeIn className="text-center px-6">
              <p className="text-xl sm:text-2xl font-semibold text-white max-w-2xl leading-relaxed">
                "It gets better. I promise."
              </p>
              <p className="mt-2 text-sm text-white/70">
                — A Safe Harbor resident to a newly arrived girl
              </p>
            </FadeIn>
          </div>
        </section>

        <ImpactCTASection
          headline="You can be part of her story"
          body="Whether through giving, volunteering, or simply spreading the word — your support gives a young girl the safety, stability, and people she needs to build a life that belongs to her."
          primaryLabel="Get Involved"
          primaryTo="/contact"
          secondaryLabel="Learn About Us"
          secondaryTo="/about"
        />
      </main>

      <Footer />
      <DonateBanner />
    </div>
  )
}
