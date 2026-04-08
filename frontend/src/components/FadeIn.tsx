import type { ReactNode } from 'react'
import { useFadeIn } from '@/lib/useFadeIn'

export function FadeIn({ children, className = '' }: { children: ReactNode; className?: string }) {
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
