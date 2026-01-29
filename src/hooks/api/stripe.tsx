import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { FetchError } from "@medusajs/js-sdk"
import { queryKeysFactory } from "../../lib/query-key-factory"
import {
  VendorPayoutAccountResponse,
  VendorCreatePayoutAccountRequest,
  VendorCreateOnboardingRequest,
} from "../../types/payout"

const STRIPE_QUERY_KEY = "stripe" as const
export const stripeQueryKeys = queryKeysFactory(STRIPE_QUERY_KEY)

export const useStripeAccount = () => {
  const { data, ...rest } = useQuery<VendorPayoutAccountResponse>({
    queryFn: () =>
      fetchQuery("/vendor/payout-account", {
        method: "GET",
      }),
    queryKey: [STRIPE_QUERY_KEY, "account"],
  })

  return { ...data, ...rest }
}

export const useCreateStripeAccount = (
  options?: UseMutationOptions<
    VendorPayoutAccountResponse,
    FetchError,
    VendorCreatePayoutAccountRequest
  >
) => {
  return useMutation({
    mutationFn: (payload) =>
      fetchQuery("/vendor/payout-account", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [STRIPE_QUERY_KEY, "account"],
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useCreateStripeOnboarding = (
  options?: UseMutationOptions<
    VendorPayoutAccountResponse,
    FetchError,
    VendorCreateOnboardingRequest
  >
) => {
  return useMutation({
    mutationFn: (payload) =>
      fetchQuery("/vendor/payout-account/onboarding", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: [STRIPE_QUERY_KEY, "onboarding"],
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
