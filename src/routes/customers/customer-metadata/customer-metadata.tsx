import { useParams } from "react-router-dom"
import { MetadataForm } from "../../../components/forms/metadata-form"
import { useCustomer, useUpdateCustomer } from "../../../hooks/api/customers"
import { FetchError } from "@medusajs/js-sdk"

export const CustomerMetadata = () => {
  const { id } = useParams()

  if (!id) {
    throw new Error("Customer ID is required")
  }
  
  const { customer, isPending, isError, error } = useCustomer(id)
  const { mutateAsync, isPending: isMutating } = useUpdateCustomer(id)

  if (isError) {
    throw error
  }

  const handleUpdate = async (
    params: { metadata?: Record<string, any> | null },
    callbacks: { onSuccess: () => void; onError: (error: FetchError) => void }
  ) => {
    return mutateAsync(
      { metadata: params.metadata ?? undefined },
      callbacks
    )
  }

  return (
    <MetadataForm
      metadata={customer?.metadata}
      hook={handleUpdate}
      isPending={isPending}
      isMutating={isMutating}
    />
  )
}
