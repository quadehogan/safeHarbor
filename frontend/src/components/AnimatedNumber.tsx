import { useAnimatedCounter } from '@/lib/useAnimatedCounter'

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number
  /** Animation duration in ms (default 800) */
  duration?: number
  /** Optional prefix like "$" or "₱" */
  prefix?: string
  /** Optional suffix like "%" or "m" */
  suffix?: string
  /** Whether to format with locale commas (default true) */
  localeFormat?: boolean
}

/**
 * Renders an animated number that counts up from 0 to the target value.
 * Drop-in replacement for static number displays in stat cards.
 */
export function AnimatedNumber({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  localeFormat = true,
}: AnimatedNumberProps) {
  const animated = useAnimatedCounter(value, duration)
  const display = localeFormat ? animated.toLocaleString() : String(animated)

  return (
    <>{prefix}{display}{suffix}</>
  )
}
