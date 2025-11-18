import { QueryClient } from "@tanstack/react-query"

import { HttpTypes } from "@medusajs/types"
import { productsQueryKeys } from "../../../hooks/api/products"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"
import { PAGE_SIZE } from "./components/product-list-table"

const productsListQuery = () => ({
  queryKey: productsQueryKeys.list({
    limit: PAGE_SIZE,
    offset: 0,
  }),
  queryFn: async () =>
    fetchQuery("/vendor/products", {
      method: "GET",
      query: {
        limit: PAGE_SIZE,
        offset: 0,
        fields: "+thumbnail,*categories,+status",
      },
    }),
})

export const productsLoader = (client: QueryClient) => {
  return async () => {
    const query = productsListQuery()

    return (
      queryClient.getQueryData<HttpTypes.AdminProductListResponse>(
        query.queryKey
      ) ?? (await client.fetchQuery(query))
    )
  }
}
