import { ShieldCheck, TrendingUp, Users, Sparkles, BookOpen, GraduationCap } from 'lucide-react'
import { FadeIn } from '@/components/FadeIn'
import { Skeleton } from '@/components/ui/skeleton'

interface ResidentOutcomesPublicProps {
  girlsCurrentlyInCare: number
  reintegrationRate: number
  inFamilyReunification: number
  livingIndependently: number
  schoolEnrollmentRate: number
  vocationalGraduates: number
  communityImg: string
  educationImg: string
  loading?: boolean
}

export function ResidentOutcomesPublic({
  girlsCurrentlyInCare,
  reintegrationRate,
  inFamilyReunification,
  livingIndependently,
  schoolEnrollmentRate,
  vocationalGraduates,
  communityImg,
  educationImg,
  loading = false,
}: ResidentOutcomesPublicProps) {
  return (
    <>
      {/* Care & Reintegration */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <FadeIn>
              <div className="rounded-xl overflow-hidden shadow-md">
                <img
                  src={communityImg}
                  alt="Girls supported through Safe Harbor's reintegration program"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
            </FadeIn>
            <FadeIn className="delay-100">
              <div className="h-1 w-12 rounded-full bg-primary mb-6" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Care & Reintegration
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                Every girl in our care has her own story and her own timeline. What they share is a
                community that believes in them — and a plan built around their strengths.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {loading ? (
                  [...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)
                ) : (
                  [
                    { value: String(girlsCurrentlyInCare), label: 'Girls Currently Supported', icon: ShieldCheck },
                    { value: `${reintegrationRate}%`, label: 'Reintegration Completed', icon: TrendingUp },
                    { value: String(inFamilyReunification), label: 'In Family Reunification', icon: Users },
                    { value: String(livingIndependently), label: 'Living Independently', icon: Sparkles },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-card border border-border p-4 text-center">
                      <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <FadeIn>
              <div className="h-1 w-12 rounded-full bg-primary mb-6" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Education That Opens Doors
              </h2>
              <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
                For many of the girls in our care, Safe Harbor is the first place they've been able to attend
                school consistently. Every education plan is personalized — because every girl's
                starting point is different.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
                {loading ? (
                  [...Array(2)].map((_, i) => <Skeleton key={i} className="h-28" />)
                ) : (
                  [
                    { value: `${schoolEnrollmentRate}%`, label: 'School Enrollment Rate', icon: BookOpen },
                    { value: String(vocationalGraduates), label: 'Vocational Graduates', icon: GraduationCap },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-muted/60 border border-border p-5 flex flex-col items-center text-center">
                      <stat.icon className="h-5 w-5 text-primary mb-2" />
                      <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))
                )}
              </div>
            </FadeIn>
            <FadeIn className="delay-100">
              <div className="rounded-xl overflow-hidden shadow-md">
                <img
                  src={educationImg}
                  alt="Girl studying at a Safe Harbor education program"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  )
}
