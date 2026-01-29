import { Review } from "./user"

export interface ReviewResponse {
  review: Review
}

export interface ReviewsListResponse {
  reviews: Review[]
}

export interface VendorUpdateReviewRequest {
  seller_note: string
}
