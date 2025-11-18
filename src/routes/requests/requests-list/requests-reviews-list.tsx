import { Container, Heading, Text } from "@medusajs/ui"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { RequestListTable } from "./components/request-list-table"
import { useRequestsReviewsTableColumns } from "./components/use-requests-reviews-table-columns"

export const RequestReviewsList = () => {
  const { getWidgets } = useDashboardExtension()

  const reviewsColumns = useRequestsReviewsTableColumns()

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("customer.list.after"),
        before: getWidgets("customer.list.before"),
      }}
    >
      <Container className="divided-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Reviews Removal Requests</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Your requests to cancel a review
            </Text>
          </div>
        </div>
        <div className="px-6 py-4">
          <RequestListTable
            request_type="review_remove"
            customColumns={reviewsColumns}
          />
        </div>
      </Container>
    </SingleColumnPage>
  )
}
