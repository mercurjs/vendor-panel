import { LoaderFunctionArgs } from "react-router-dom"
import { promotionsQueryKeys } from "../../../hooks/api/promotions"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const promotionDetailQuery = (id: string) => ({
  queryKey: promotionsQueryKeys.detail(id),
  queryFn: async () =>
    fetchQuery(`/vendor/promotions/${id}`, {
      method: "GET",
      query: { fields: "+status" },
    }),
})

export const promotionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = promotionDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
