import { LoaderFunctionArgs } from "react-router-dom"
import { productsQueryKeys } from "../../../hooks/api/products"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"
import { CUSTOMER_GROUP_DETAIL_FIELDS } from "./constants"

const customerGroupDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id),
  queryFn: async () =>
    fetchQuery(`/vendor/customer-groups/${id}`, {
      method: "GET",
      query: { fields: CUSTOMER_GROUP_DETAIL_FIELDS },
    }),
})

export const customerGroupLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = customerGroupDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
