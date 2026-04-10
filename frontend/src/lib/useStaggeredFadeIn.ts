/**
 * Returns inline style with a staggered animation-delay for the given index.
 * Use with animate-card-in or animate-row-in CSS classes.
 */
export function staggerDelay(index: number, interval = 80): React.CSSProperties {
  return { animationDelay: `${index * interval}ms`, animationFillMode: 'both' }
}
