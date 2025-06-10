import { useParams } from "react-router-dom"
import { RouteModalProvider } from "../../../components/modals/route-modal-provider"
import { ReviewReportForm } from "./components/review-report-form"
import { useRequest } from "../../../hooks/api"

export const ReviewReport = () => {
  const { id } = useParams()

  const { request, isLoading } = useRequest(id!)

  if (isLoading) return <div>Loading...</div>

  return (
    <RouteModalProvider prev={`/reviews/${id}`}>
      <ReviewReportForm request={request} />
    </RouteModalProvider>
  )
}
