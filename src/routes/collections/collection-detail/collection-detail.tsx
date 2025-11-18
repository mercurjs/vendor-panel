import { useLoaderData, useParams } from "react-router-dom"

import { SingleColumnPageSkeleton } from "../../../components/common/skeleton"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useCollection } from "../../../hooks/api/collections"
import { CollectionGeneralSection } from "./components/collection-general-section"
import { CollectionProductSection } from "./components/collection-product-section"
import { collectionLoader } from "./loader"

export const CollectionDetail = () => {
  const initialData = useLoaderData() as Awaited<
    ReturnType<typeof collectionLoader>
  >

  const { id } = useParams()
  const { product_collection, isLoading, isError, error } = useCollection(id!, {
    initialData,
  })

  const { getWidgets } = useDashboardExtension()

  if (isLoading || !product_collection) {
    return <SingleColumnPageSkeleton sections={2} />
  }

  if (isError) {
    throw error
  }

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("product_collection.details.after"),
        before: getWidgets("product_collection.details.before"),
      }}
      data={product_collection}
    >
      <CollectionGeneralSection collection={product_collection} />
      <CollectionProductSection collection={product_collection} />
    </SingleColumnPage>
  )
}
