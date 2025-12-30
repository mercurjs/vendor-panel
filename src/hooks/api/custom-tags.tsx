import { FetchError } from "@medusajs/js-sdk"
import {
  QueryKey,
  useMutation,
  UseMutationOptions,
  UseQueryOptions,
  useQuery,
} from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryKeysFactory } from "../../lib/query-key-factory"
import { queryClient } from "../../lib/query-client"

const CUSTOM_TAGS_QUERY_KEY = "custom_tags" as const
export const customTagsQueryKeys = queryKeysFactory(CUSTOM_TAGS_QUERY_KEY)

export interface CustomTag {
  id: string
  value: string
  type: "pet_type" | "brand"
  status: "pending" | "approved" | "rejected"
  requested_by?: string
  approved_by?: string
  rejected_reason?: string
  created_at: string
  updated_at: string
}

export interface CustomTagsResponse {
  tags: CustomTag[]
  count: number
}

export interface CustomTagsQuery {
  type?: "pet_type" | "brand"
}

export const useCustomTags = (
  query?: CustomTagsQuery,
  options?: Omit<
    UseQueryOptions<
      CustomTagsResponse,
      FetchError,
      CustomTagsResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery("/vendor/custom-tags", {
        method: "GET",
        query: query as { [key: string]: string | number },
      }),
    queryKey: customTagsQueryKeys.list(query),
    ...options,
  })

  return { data, ...rest }
}

export interface CreateCustomTagPayload {
  value: string
  type: "pet_type" | "brand"
}

export const useCreateCustomTag = (
  options?: UseMutationOptions<
    { tag: CustomTag; message: string },
    FetchError,
    CreateCustomTagPayload
  >
) => {
  return useMutation({
    mutationFn: (payload: CreateCustomTagPayload) =>
      fetchQuery("/vendor/custom-tags", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: customTagsQueryKeys.lists(),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
