import { PencilSquare } from "@medusajs/icons"

import { ActionMenu } from "../../../../components/common/action-menu"
import { useTranslation } from "react-i18next"

const getRequestType = (type: string) => {
  switch (type) {
    case "product_category":
      return "categories"
    case "product_collection":
      return "collections"
    case "review_remove":
      return "reviews"
    default:
      return ""
  }
}
export const RequestsActions = ({ request }: { request: any }) => {
  const { t } = useTranslation()

  const type = getRequestType(request.type)

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              label: t("actions.edit"),
              to: `/requests/${type}/${request.id}/edit`,
              icon: <PencilSquare />,
            },
          ],
        },
      ]}
    />
  )
}
