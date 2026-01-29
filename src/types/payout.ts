export enum VendorPayoutAccountStatus {
  PENDING = "pending",
  ACTIVE = "active",
  DISABLED = "disabled",
}

export interface VendorOnboarding {
  id: string
  data: {
    url?: string
    [key: string]: unknown
  } | null
  context: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface VendorPayoutAccount {
  id: string
  status: VendorPayoutAccountStatus
  reference_id: string
  data: Record<string, unknown>
  context: Record<string, unknown> | null
  onboarding: VendorOnboarding | null
  created_at: string
  updated_at: string
}

export interface VendorPayoutAccountResponse {
  payout_account: VendorPayoutAccount
}

export interface VendorCreatePayoutAccountRequest {
  context?: Record<string, unknown>
}

export interface VendorCreateOnboardingRequest {
  context?: Record<string, unknown>
}
