// Inline field validation error -- renders below form fields
// Style: text-sm text-destructive (per ui-components.md)
export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-destructive mt-1">{message}</p>
}
