import { Heading } from "@medusajs/ui"

import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { RouteDrawer } from "../../../components/modals"
import { EditCategoryForm } from "./components/edit-category-form"
import { useRequest } from "../../../hooks/api"

export const CategoryEdit = () => {
  const { id } = useParams()
  const { t } = useTranslation()

  const { request, isPending, isError, error } = useRequest(id!)

  const ready = !isPending && !!request

  if (isError) {
    throw error
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>Edit Category Request</Heading>
        </RouteDrawer.Title>
        <RouteDrawer.Description className="sr-only">
          {t("categories.edit.description")}
        </RouteDrawer.Description>
      </RouteDrawer.Header>
      {ready && <EditCategoryForm category={request.data} requestId={id!} />}
    </RouteDrawer>
  )
}
