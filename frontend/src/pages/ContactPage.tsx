import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Clock, ArrowRight, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const contactInfo = [
  {
    icon: Mail,
    title: 'Write to Us',
    detail: 'info@safeharbor.org',
    sub: 'We\'ll get back to you within a day',
  },
  {
    icon: MapPin,
    title: 'Where We Are',
    detail: 'Manila, Philippines',
    sub: 'With safe homes across Luzon, Visayas & Mindanao',
  },
  {
    icon: Clock,
    title: 'When We\'re Available',
    detail: 'Monday through Friday',
    sub: '8:00 AM - 5:00 PM Philippine Time',
  },
]

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSending(true)

    // Simulate submission
    setTimeout(() => {
      toast.success('Thank you for reaching out! We\'ll be in touch soon.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setSending(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ===== HERO BANNER ===== */}
        <section className="bg-muted/60 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              We'd love to hear from you
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you're moved to give, ready to volunteer your time, or
              simply want to learn more about the girls we serve, don't
              hesitate to reach out.
            </p>
          </div>
        </section>

        {/* ===== CONTACT FORM ===== */}
        <section className="bg-background">
          <div className="mx-auto max-w-2xl px-6 lg:px-8 py-16 sm:py-20">
            <div className="text-center mb-10">
              <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-primary" />
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Tell us a little about yourself and how you'd like to help.
                We read every message personally.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-xl bg-card border border-border p-6 sm:p-8 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Your name *</Label>
                  <Input
                    id="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First and last name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="subject">How can we help? *</Label>
                <Select value={subject} onValueChange={setSubject} required>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Choose a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donate">I'd like to make a donation</SelectItem>
                    <SelectItem value="volunteer">I'd like to volunteer my time</SelectItem>
                    <SelectItem value="partner">I represent an organization</SelectItem>
                    <SelectItem value="story">I'd like to share a story</SelectItem>
                    <SelectItem value="general">Just saying hello</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="message">Your message *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your heart..."
                />
              </div>

              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message
                    <Heart className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </section>

        {/* ===== CONTACT INFO ===== */}
        <section className="bg-muted/40">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 py-16 sm:py-20">
            <h2 className="text-xl font-semibold text-foreground text-center mb-10">
              Other ways to reach us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {contactInfo.map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl bg-card border border-border p-6 text-center"
                >
                  <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {item.detail}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-primary/10">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 py-16 sm:py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Every connection matters
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Learn about the girls whose lives are being transformed, and
              discover how your support makes it possible.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
              >
                Our Story
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/impact"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                See Our Impact
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
