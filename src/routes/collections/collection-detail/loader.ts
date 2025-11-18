import { LoaderFunctionArgs } from "react-router-dom"

import { collectionsQueryKeys } from "../../../hooks/api/collections"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const collectionDetailQuery = (id: string) => ({
  queryKey: collectionsQueryKeys.detail(id),
  queryFn: async () =>
    fetchQuery(`/vendor/product-collections/${id}`, {
      method: "GET",
    }),
})

export const collectionLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = collectionDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
