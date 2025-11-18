import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { RouteDrawer } from "../../../components/modals"
import { EditStoreForm } from "./components/edit-store-form/edit-store-form"
import { useMe } from "../../../hooks/api"

export const StoreEdit = () => {
  const { t } = useTranslation()
  const { seller, isPending: isLoading, isError, error } = useMe()

  if (isError) {
    throw error
  }

  const ready = !!seller && !isLoading

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t("store.edit.header")}</Heading>
      </RouteDrawer.Header>
      {ready && <EditStoreForm seller={seller} />}
    </RouteDrawer>
  )
}
