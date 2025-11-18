import { useLoaderData, useParams } from "react-router-dom"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useReview } from "../../../hooks/api/review"
import { ReviewGeneralSection } from "./components/review-general-section"
import { reviewLoader } from "./loader"
import { TwoColumnPageSkeleton } from "../../../components/common/skeleton"
import { ReviewCustomerSection } from "./components/review-customer-section"
import { ReviewProductSection } from "./components/review-product-section"
import { useRequests } from "../../../hooks/api"

export const ReviewDetail = () => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof reviewLoader>
  >

  const { id } = useParams()
  const { review, isLoading, isError, error } = useReview(
    id!,
    { fields: "*customer" },
    { initialData }
  )

  const { requests, isLoading: isRequestsLoading } = useRequests()

  const isRequested = requests?.some(
    (request: any) =>
      request.type === "review_remove" && request.data.review_id === id
  )

  const { getWidgets } = useDashboardExtension()
  if (isLoading || !review || isRequestsLoading) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={3}
        showJSON
        showMetadata
      />
    )
  }

  if (isError) {
    throw error
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("campaign.details.after"),
        before: getWidgets("campaign.details.before"),
        sideAfter: getWidgets("campaign.details.side.after"),
        sideBefore: getWidgets("campaign.details.side.before"),
      }}
      data={review}
    >
      <TwoColumnPage.Main>
        <ReviewGeneralSection review={review} isRequested={isRequested} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <ReviewCustomerSection customer={review.customer} />
        {review.reference !== "seller" && <ReviewProductSection />}
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}
