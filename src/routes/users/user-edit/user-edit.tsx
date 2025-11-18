import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import { RouteDrawer } from "../../../components/modals"
import { useUser } from "../../../hooks/api/users"
import { EditUserForm } from "./components/edit-user-form"

export const UserEdit = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const { member, isPending: isLoading, isError, error } = useUser(id!)

  if (isError) {
    throw error
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t("users.editUser")}</Heading>
      </RouteDrawer.Header>
      {!isLoading && member && <EditUserForm member={member} />}
    </RouteDrawer>
  )
}
