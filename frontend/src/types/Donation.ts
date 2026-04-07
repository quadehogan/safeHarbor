import type { Supporter } from './Supporter'

export interface Donation {
  donationId: number
  supporterId: number
  donationType: string
  donationDate: string
  isRecurring: boolean
  campaignName: string | null
  channelSource: string | null
  currencyCode: string | null
  amount: number | null
  estimatedValue: number | null
  impactUnit: string | null
  notes: string | null
  referralPostId: number | null
  supporter?: Supporter
  donationAllocations?: DonationAllocation[]
  inKindDonationItems?: InKindDonationItem[]
}

export interface DonationAllocation {
  donationAllocationId: number
  donationId: number
  safehouseId: number | null
  programArea: string | null
  amountAllocated: number
  allocationDate: string | null
  allocationNotes: string | null
}

export interface InKindDonationItem {
  inKindDonationItemId: number
  donationId: number
  itemName: string | null
  itemCategory: string | null
  quantity: number
  unitOfMeasure: string | null
  estimatedUnitValue: number | null
  intendedUse: string | null
  receivedCondition: string | null
}
