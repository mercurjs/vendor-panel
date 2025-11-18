import { LoaderFunctionArgs } from "react-router-dom"
import { reviewsQueryKeys } from "../../../hooks/api/review"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const requestDetailQuery = (id: string) => ({
  queryKey: reviewsQueryKeys.detail(id),
  queryFn: async () =>
    fetchQuery(`/vendor/requests/${id}`, {
      method: "GET",
    }),
})

export const requestLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = requestDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
