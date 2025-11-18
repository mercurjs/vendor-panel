import { useParams } from "react-router-dom"
import { RouteModalProvider } from "../../../components/modals/route-modal-provider"
import { ReviewReplyForm } from "./components/review-reply-form"

export const ReviewReply = () => {
  const { id } = useParams()

  return (
    <RouteModalProvider prev={`/reviews/${id}`}>
      <ReviewReplyForm />
    </RouteModalProvider>
  )
}
