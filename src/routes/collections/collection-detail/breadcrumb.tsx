import { HttpTypes } from "@medusajs/types"
import { UIMatch } from "react-router-dom"
import { useCollection } from "../../../hooks/api"

type CollectionDetailBreadcrumbProps =
  UIMatch<HttpTypes.AdminCollectionResponse>

export const CollectionDetailBreadcrumb = (
  props: CollectionDetailBreadcrumbProps
) => {
  const { id } = props.params || {}

  const { product_collection } = useCollection(id!, {
    initialData: { product_collection: props.data.collection },
  })

  if (!product_collection) {
    return null
  }

  return <span>{product_collection.title}</span>
}
