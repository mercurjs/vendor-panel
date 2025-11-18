import { LoaderFunctionArgs } from "react-router-dom"
import { reservationItemsQueryKeys } from "../../../hooks/api/reservations"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const reservationDetailQuery = (id: string) => ({
  queryKey: reservationItemsQueryKeys.detail(id),
  queryFn: async () =>
    fetchQuery(`/vendor/reservations/${id}`, {
      method: "GET",
    }),
})

export const reservationItemLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id
  const query = reservationDetailQuery(id!)

  return queryClient.ensureQueryData(query)
}
