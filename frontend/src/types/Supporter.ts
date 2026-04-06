export interface Supporter {
  supporterId: number
  supporterType: string
  displayName: string | null
  organizationName: string | null
  firstName: string | null
  lastName: string | null
  relationshipType: string | null
  region: string | null
  country: string | null
  email: string | null
  phone: string | null
  status: string
  firstDonationDate: string | null
  acquisitionChannel: string | null
  createdAt: string
  donations?: Donation[]
}

import type { Donation } from './Donation'
