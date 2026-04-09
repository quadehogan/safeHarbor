import { useState } from 'react'
import type { Supporter } from '@/types/Supporter'
import type { Donation } from '@/types/Donation'
import { useFormValidation, required, requiredSelect, positiveNumber } from '@/lib/useFormValidation'
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

export const DONATION_TYPES = ['Monetary', 'InKind', 'Time', 'Skills', 'SocialMedia']

export const CAMPAIGNS = [
  'Year-End Hope',
  'Summer of Safety',
  'Back to School',
  'GivingTuesday',
]

export const CHANNELS = ['Campaign', 'Event', 'Direct', 'SocialMedia', 'PartnerReferral']

function supporterName(s: Supporter): string {
  return s.displayName ?? (`${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—')
}

export function DonationForm({
  donation,
  supporters,
  onSave,
  onCancel,
  hideCancel = false,
}: {
  donation: Donation | null
  supporters: Supporter[]
  onSave: (data: Partial<Donation>) => void
  onCancel: () => void
  hideCancel?: boolean
}) {
  const [form, setForm] = useState({
    supporterId: donation?.supporterId ?? 0,
    donationType: donation?.donationType ?? 'Monetary',
    donationDate: donation?.donationDate
      ? new Date(donation.donationDate).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    isRecurring: donation?.isRecurring ?? false,
    campaignName: donation?.campaignName ?? '',
    channelSource: donation?.channelSource ?? '',
    amount: donation?.amount ?? 0,
    estimatedValue: donation?.estimatedValue ?? 0,
    impactUnit: donation?.impactUnit ?? 'dollars',
    notes: donation?.notes ?? '',
    currencyCode: 'USD',
  })

  const { validate, fieldError, clearError } = useFormValidation<typeof form>({
    supporterId: (value) => {
      if (!value || value === 0) return 'Please select a supporter'
      return ''
    },
    donationType: requiredSelect('donation type'),
    donationDate: required('Donation date'),
    amount: positiveNumber('Amount'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate(form)) return
    onSave({
      ...form,
      campaignName: form.campaignName || null,
      channelSource: form.channelSource || null,
      amount: form.amount || null,
      estimatedValue: form.estimatedValue || null,
      notes: form.notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Supporter *</Label>
        <Select
          value={form.supporterId ? String(form.supporterId) : ''}
          onValueChange={(v: string) => {
            setForm({ ...form, supporterId: parseInt(v) })
            clearError('supporterId')
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select supporter..." />
          </SelectTrigger>
          <SelectContent>
            {supporters.map((s) => (
              <SelectItem key={s.supporterId} value={String(s.supporterId)}>
                {supporterName(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError message={fieldError('supporterId')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type *</Label>
          <Select
            value={form.donationType}
            onValueChange={(v: string) => {
              setForm({ ...form, donationType: v })
              clearError('donationType')
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DONATION_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={fieldError('donationType')} />
        </div>
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={form.donationDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setForm({ ...form, donationDate: e.target.value })
              clearError('donationDate')
            }}
          />
          <FieldError message={fieldError('donationDate')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Amount (USD)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setForm({ ...form, amount: parseFloat(e.target.value) || 0 })
              clearError('amount')
            }}
          />
          <FieldError message={fieldError('amount')} />
        </div>
        <div className="space-y-2">
          <Label>Estimated Value</Label>
          <Input
            type="number"
            step="0.01"
            value={form.estimatedValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm({ ...form, estimatedValue: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Campaign</Label>
          <Select
            value={form.campaignName}
            onValueChange={(v: string) => setForm({ ...form, campaignName: v === 'none' ? '' : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
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
        <div className="space-y-2">
          <Label>Channel</Label>
          <Select
            value={form.channelSource}
            onValueChange={(v: string) => setForm({ ...form, channelSource: v === 'none' ? '' : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {CHANNELS.map((c) => (
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
          id="isRecurring"
          checked={form.isRecurring}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setForm({ ...form, isRecurring: e.target.checked })
          }
          className="h-4 w-4 rounded border-input accent-primary"
        />
        <Label htmlFor="isRecurring">Recurring donation</Label>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={form.notes}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        {!hideCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{donation ? 'Save Changes' : 'Create Donation'}</Button>
      </div>
    </form>
  )
}
