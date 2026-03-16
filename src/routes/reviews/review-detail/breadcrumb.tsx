import { UIMatch } from "react-router-dom"
import { useReview } from "../../../hooks/api/review"
import { ReviewResponse } from "../../../types/review"

type ReviewDetailBreadcrumbProps = UIMatch<ReviewResponse>

export const ReviewDetailBreadcrumb = (props: ReviewDetailBreadcrumbProps) => {
  const { id } = props.params || {}

  const { review } = useReview(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id),
  })

  if (!review) {
    return null
  }

  const display = review.id

  return <span>{display}</span>
}
