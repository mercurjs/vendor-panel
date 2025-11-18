import { UIMatch } from "react-router-dom"
import { useReview } from "../../../hooks/api/review"

type ReviewDetailBreadcrumbProps = UIMatch<any>

export const RequestDetailBreadcrumb = (props: ReviewDetailBreadcrumbProps) => {
  const { id } = props.params || {}

  const { review } = useReview(id!, undefined, {
    initialData: props.data,
    enabled: Boolean(id),
  }) as any

  if (!review) {
    return null
  }

  const display = review.id

  return <span>{display}</span>
}
