import { LoaderFunctionArgs } from "react-router-dom"

import { apiKeysQueryKeys } from "../../../hooks/api/api-keys"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const apiKeyDetailQuery = (id: string) => ({
  queryKey: apiKeysQueryKeys.detail(id),
  queryFn: async () => fetchQuery(`/vendor/api-keys/${id}`, { method: "GET" }),
})

export const apiKeyLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = apiKeyDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
