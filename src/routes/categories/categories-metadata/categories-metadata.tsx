import { useParams } from "react-router-dom"

import {
  useProductCategory,
  useUpdateProductCategory,
} from "../../../hooks/api"
import { MetadataForm } from "../../../components/forms/metadata-form"
import { RouteDrawer } from "../../../components/modals"
import { FetchError } from "@medusajs/js-sdk"

export const CategoriesMetadata = () => {
  const { id } = useParams()

  const { product_category, isPending, isError, error } = useProductCategory(id!)
  const { mutateAsync, isPending: isMutating } = useUpdateProductCategory(id!)

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
        metadata={product_category?.metadata}
      />
    </RouteDrawer>
  )
}
