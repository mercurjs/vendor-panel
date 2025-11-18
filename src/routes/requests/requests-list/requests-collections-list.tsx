import { Button, Container, Heading, Text } from "@medusajs/ui"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { RequestListTable } from "./components/request-list-table"
import { Link } from "react-router-dom"

export const RequestsCollectionsList = () => {
  const { getWidgets } = useDashboardExtension()

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
            <Heading>Collection Requests</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Your requests to add a new collection
            </Text>
          </div>
          <Button variant="secondary" asChild>
            <Link to="create">Request Collection</Link>
          </Button>
        </div>
        <div className="px-6 py-4">
          <RequestListTable request_type="product_collection" />
        </div>
      </Container>
    </SingleColumnPage>
  )
}
