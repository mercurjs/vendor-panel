import { LoaderFunctionArgs } from "react-router-dom"

import { productsQueryKeys } from "../../../hooks/api/products"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"
import { PRODUCT_DETAIL_FIELDS } from "./constants"

const productDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id, {
    fields: PRODUCT_DETAIL_FIELDS,
  }),
  queryFn: async () =>
    Promise.all([
      fetchQuery(`/vendor/products/${id}`, {
        method: "GET",
        query: {
          fields: [
            "*variants.inventory_items,*categories,attribute_values.*,attribute_values.attribute.*",
            PRODUCT_DETAIL_FIELDS,
          ]
            .filter(Boolean)
            .join(","),
        },
      }),
      fetchQuery(`/vendor/products/${id}/custom-tags`, {
        method: "GET",
      }).catch(() => null),
    ]).then(([productRes, tagsRes]) => {
      const product = (productRes as any)?.product ?? productRes
      if (tagsRes && (tagsRes as any).custom_tags) {
        product.custom_tags = (tagsRes as any).custom_tags
      }

      return product
    }),
})

export const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = productDetailQuery(id!)
  
  const response = await queryClient.ensureQueryData({
    ...query,
    staleTime: 90000,
  })

  return response
}
