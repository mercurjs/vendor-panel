import { UIMatch } from "react-router-dom"
import { useOrder } from "../../../hooks/api"
import { ExtendedAdminOrderResponse } from "../../../types/order"
import { DEFAULT_FIELDS } from "./constants"

type OrderDetailBreadcrumbProps = UIMatch<ExtendedAdminOrderResponse>

export const OrderDetailBreadcrumb = (props: OrderDetailBreadcrumbProps) => {
  const { id } = props.params || {}

  const { order } = useOrder(
    id!,
    {
      fields: DEFAULT_FIELDS,
    },
    {
      initialData: props.data,
      enabled: Boolean(id),
    }
  )

  if (!order) {
    return null
  }

  return <span>#{order.display_id}</span>
}
