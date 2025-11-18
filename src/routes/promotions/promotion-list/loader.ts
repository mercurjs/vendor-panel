import { HttpTypes } from "@medusajs/types"
import { QueryClient } from "@tanstack/react-query"
import { promotionsQueryKeys } from "../../../hooks/api/promotions"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const params = {
  limit: 20,
  offset: 0,
}

const promotionsListQuery = () => ({
  queryKey: promotionsQueryKeys.list(params),
  queryFn: async () =>
    fetchQuery("/vendor/promotions", {
      method: "GET",
    }),
})

export const promotionsLoader = (client: QueryClient) => {
  return async () => {
    const query = promotionsListQuery()

    return (
      queryClient.getQueryData<HttpTypes.AdminPromotionListResponse>(
        query.queryKey
      ) ?? (await client.fetchQuery(query))
    )
  }
}
