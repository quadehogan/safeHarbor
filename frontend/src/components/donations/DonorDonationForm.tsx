import { useState } from 'react'
import type { Donation } from '@/types/Donation'
import { useFormValidation } from '@/lib/useFormValidation'
import { FieldError } from '@/components/FieldError'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DONATION_TYPES, CAMPAIGNS } from '@/components/donations/DonationForm'

type DonorDonationFormProps = {
  submitting?: boolean
  onSubmit: (data: Partial<Donation>) => Promise<void> | void
}

function amountRequired(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Amount is required'
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(n) || n <= 0) return 'Enter an amount greater than zero'
  return ''
}

const INITIAL_FORM = {
  donationType: '',
  isRecurring: false,
  campaignName: '',
  amount: 0,
  impactUnit: 'dollars',
  notes: '',
  currencyCode: 'USD',
}

export function DonorDonationForm({ submitting = false, onSubmit }: DonorDonationFormProps) {
  const [form, setForm] = useState({ ...INITIAL_FORM })

  const { validate, fieldError, clearError } = useFormValidation<typeof form>({
    amount: amountRequired,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(form)) return
    try {
      await onSubmit({
        donationType: form.donationType || '',
        isRecurring: form.isRecurring,
        campaignName: form.campaignName || null,
        amount: form.amount,
        notes: form.notes || null,
        impactUnit: form.impactUnit,
        currencyCode: form.currencyCode,
      })
      setForm({ ...INITIAL_FORM })
    } catch {
      // Parent already showed the error toast; keep form values so the user can retry
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Amount (USD) *</Label>
        <Input
          type="number"
          step="0.01"
          min={0.01}
          value={form.amount || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value
            setForm({
              ...form,
              amount: raw === '' ? 0 : parseFloat(raw) || 0,
            })
            clearError('amount')
          }}
        />
        <FieldError message={fieldError('amount')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={form.donationType || 'none'}
            onValueChange={(v: string) =>
              setForm({ ...form, donationType: v === 'none' ? '' : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {DONATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Campaign</Label>
          <Select
            value={form.campaignName || 'none'}
            onValueChange={(v: string) => setForm({ ...form, campaignName: v === 'none' ? '' : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {CAMPAIGNS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="donor-isRecurring"
          checked={form.isRecurring}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, isRecurring: e.target.checked })
          }
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor="donor-isRecurring">Recurring donation</Label>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={form.notes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Record donation'}
        </Button>
      </div>
    </form>
  )
}
