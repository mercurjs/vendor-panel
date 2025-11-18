import { Heading } from "@medusajs/ui"
import { RouteDrawer } from "../../../components/modals"
import { useMe } from "../../../hooks/api"
import { EditStoreCompanyForm } from "./components/edit-store-company-form"

export const StoreEditCompany = () => {
  const { seller, isPending: isLoading, isError, error } = useMe()

  if (isError) {
    throw error
  }

  const ready = !!seller && !isLoading
  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>Edit Comapny</Heading>
      </RouteDrawer.Header>
      {ready && <EditStoreCompanyForm seller={seller} />}
    </RouteDrawer>
  )
}
