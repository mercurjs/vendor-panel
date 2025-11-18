import { LoaderFunctionArgs } from "react-router-dom"
import { fetchQuery } from "../../../lib/client"
import { productsQueryKeys } from "../../../hooks/api"
import { queryClient } from "../../../lib/query-client"

const productDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id),
  queryFn: async () =>
    fetchQuery(`/vendor/products/${id}`, {
      method: "GET",
    }),
})

export const productStockLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id!
  const query = productDetailQuery(id!)

  const response = await queryClient.ensureQueryData({
    ...query,
    staleTime: 90000,
  })

  return response
}
