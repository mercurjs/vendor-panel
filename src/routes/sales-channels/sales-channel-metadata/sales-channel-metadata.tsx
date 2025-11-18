import { useParams } from "react-router-dom"

import { RouteDrawer } from "../../../components/modals"
import { MetadataForm } from "../../../components/forms/metadata-form"
import { useSalesChannel, useUpdateSalesChannel } from "../../../hooks/api"
import { FetchError } from "@medusajs/js-sdk"

export const SalesChannelMetadata = () => {
  const { id } = useParams()

  const {
    sales_channel: salesChannel,
    isPending,
    isError,
    error,
  } = useSalesChannel(id!)
  const { mutateAsync, isPending: isMutating } = useUpdateSalesChannel(id!)

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
    <RouteDrawer>
      <MetadataForm
        isPending={isPending}
        isMutating={isMutating}
        hook={handleUpdate}
        metadata={salesChannel?.metadata}
      />
    </RouteDrawer>
  )
}
