import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { json, useParams } from "react-router-dom"

import { RouteDrawer } from "../../../components/modals"
import { useProduct, useProductAttributes } from "../../../hooks/api/products"
import { PRODUCT_DETAIL_FIELDS } from "../product-detail/constants"
import { EditProductAttributeForm } from "./components/edit-product-attribute-form"

export const ProductEditAttribute = () => {
  const { id, attribute_id } = useParams()
  const { t } = useTranslation()

  const { product, isPending, isFetching, isError, error } = useProduct(id!, {
    fields: PRODUCT_DETAIL_FIELDS,
  })

  const { attributes } = useProductAttributes(id!)

  const attribute = product?.informational_attributes?.find(
    (a) => a.attribute_id === attribute_id
  )

  const attributeDefinition = attributes?.find((a) => a.id === attribute_id)

  if (!isPending && !isFetching && !attribute) {
    throw json(
      { message: `An attribute with ID ${attribute_id} was not found` },
      404
    )
  }

  if (isError) {
    throw error
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>{t("products.attributes.edit.header", "Edit Attribute")}</Heading>
      </RouteDrawer.Header>
      {attribute && (
        <EditProductAttributeForm
          productId={id!}
          attribute={attribute}
          attributeDefinition={attributeDefinition}
        />
      )}
    </RouteDrawer>
  )
}
