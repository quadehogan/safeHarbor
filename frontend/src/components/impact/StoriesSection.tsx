import { FadeIn } from '@/components/FadeIn'
import { AnonymizedStoryCard } from './AnonymizedStoryCard'

interface Story {
  label: string
  text: string
  status: string
  image: string
}

interface StoriesSectionProps {
  stories: Story[]
}

export function StoriesSection({ stories }: StoriesSectionProps) {
  return (
    <section className="bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-20">
        <FadeIn className="text-center mb-12">
          <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">In Their Own Words</h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Names and details have been changed to protect privacy. These are real girls, and these
            are their own words about what their lives look like today.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story, i) => (
            <FadeIn key={story.label} className={i > 0 ? `delay-${i * 100}` : ''}>
              <AnonymizedStoryCard {...story} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
