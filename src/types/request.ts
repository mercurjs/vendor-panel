import { HttpTypes} from "@medusajs/types"

export interface Request {
  id: string
  type: string
  data: Record<string, unknown>
  submitter_id: string
  reviewer_id: string | null
  reviewer_note: string | null
  status: "pending" | "accepted" | "rejected" | "draft"
  created_at: string
  updated_at: string
}

export interface RequestResponse {
  request: Request
}

export interface RequestsListResponse extends HttpTypes.PaginatedResponse<Request> {
  requests: Request[]
}

export interface VendorCreateRequestPayload {
  request: {
    type:
      | "product_category"
      | "product_collection"
      | "product_collection_update"
      | "review_remove"
      | "product_type"
      | "product_tag"
    data: Record<string, unknown>
  }
}

export interface VendorUpdateRequestDataPayload {
  request: {
    type:
      | "product_category"
      | "product_collection"
      | "review_remove"
      | "product_type"
      | "product_tag"
    data: Record<string, unknown>
  }
}

export interface OrderReturnRequestLineItem {
  id: string
  line_item_id: string
  quantity: number
}

export interface OrderReturnRequest {
  id: string
  customer_id: string
  customer_note: string
  shipping_option_id: string | null
  vendor_reviewer_id: string | null
  vendor_reviewer_note: string | null
  vendor_reviewer_date: string | null
  admin_reviewer_id: string | null
  admin_reviewer_note: string | null
  admin_reviewer_date: string | null
  status: "pending" | "refunded" | "withdrawn" | "escalated" | "canceled"
  line_items?: OrderReturnRequestLineItem[]
  order: {
    id: string
    display_id: number
    customer: {
      first_name: string
      last_name: string
      email: string
    }
  }
  created_at: string
  updated_at: string
}

export interface OrderReturnRequestResponse {
  order_return_request: OrderReturnRequest
}

export interface OrderReturnRequestsListResponse extends HttpTypes.PaginatedResponse<OrderReturnRequest> {
  order_return_request: OrderReturnRequest[]
}

export interface VendorUpdateOrderReturnRequestPayload {
  vendor_reviewer_note: string
  status: "refunded" | "withdrawn" | "escalated"
  location_id?: string
}
