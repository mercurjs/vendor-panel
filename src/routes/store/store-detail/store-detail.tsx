import { useLoaderData } from "react-router-dom"

import { useStore } from "../../../hooks/api/store.tsx"
import { StoreGeneralSection } from "./components/store-general-section/index.ts"
import { storeLoader } from "./loader.ts"

import { SingleColumnPageSkeleton } from "../../../components/common/skeleton/skeleton.tsx"
import { SingleColumnPage } from "../../../components/layout/pages/index.ts"
import { useDashboardExtension } from "../../../extensions/index.ts"
import { CompanySection } from "./components/company-section/company-section.tsx"
import { useMe } from "../../../hooks/api/users.tsx"

export const StoreDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof storeLoader>>

  const { store, isPending, isError, error } = useStore(undefined, {
    initialData,
  })

  const { seller, isPending: sellerPending, isError: sellerError } = useMe()

  const { getWidgets } = useDashboardExtension()

  if (isPending || sellerPending || !store || !seller) {
    return <SingleColumnPageSkeleton sections={2} />
  }

  if (isError || sellerError) {
    throw error
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("store.details.before"),
        after: getWidgets("store.details.after"),
      }}
      data={store}
      hasOutlet
    >
      <StoreGeneralSection seller={seller} />
      <CompanySection seller={seller} />
    </SingleColumnPage>
  )
}
