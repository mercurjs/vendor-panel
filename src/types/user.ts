import { HttpTypes } from "@medusajs/types"

export interface Review {
  id: string
  rating: number
  reference: "product" | "seller"
  customer_note: string | null
  customer_id: string
  seller_note: string | null
  created_at: string
  updated_at?: string | null
  customer?: HttpTypes.AdminCustomer
}

export interface StoreVendor {
  id?: string
  name?: string
  phone?: string
  email?: string
  description?: string
  handle?: string
  photo?: string
  created_at?: string
  product?: HttpTypes.StoreProduct[]
  review?: Review | Review[]
  address_line?: string
  postal_code?: string
  city?: string
  country_code?: string
  tax_id?: string
  store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE"
}

export interface TeamMemberProps {
  id: string
  seller_id: string
  name: string
  email?: string
  photo?: string
  bio?: string
  phone?: string
  role: string
}
