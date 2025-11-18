import { HttpTypes } from "@medusajs/types"
import { LoaderFunctionArgs } from "react-router-dom"

import { productTagsQueryKeys } from "../../../hooks/api"
import { fetchQuery } from "../../../lib/client"
import { queryClient } from "../../../lib/query-client"

const productTagListQuery = (query?: HttpTypes.AdminProductTagListParams) => ({
  queryKey: productTagsQueryKeys.list(query),
  queryFn: async () =>
    fetchQuery("/vendor/product-tags", {
      method: "GET",
      query: query as { [key: string]: string | number },
    }),
})

export const productTagListLoader = async ({ request }: LoaderFunctionArgs) => {
  const searchParams = new URL(request.url).searchParams

  const queryObject: Record<string, string> = {}

  searchParams.forEach((value, key) => {
    try {
      queryObject[key] = JSON.parse(value)
    } catch (_e) {
      queryObject[key] = value
    }
  })

  const query = productTagListQuery(
    queryObject as HttpTypes.AdminProductTagListParams
  )

  return (
    queryClient.getQueryData<any>(query.queryKey) ??
    (await queryClient.fetchQuery(query))
  )
}
