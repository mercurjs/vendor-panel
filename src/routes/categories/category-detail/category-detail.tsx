import { useParams } from "react-router-dom"

import { CategoryGeneralSection } from "./components/category-general-section"
import { CategoryOrganizeSection } from "./components/category-organize-section"
import { CategoryProductSection } from "./components/category-product-section"

import { TwoColumnPageSkeleton } from "../../../components/common/skeleton"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useProductCategory } from "../../../hooks/api"

export const CategoryDetail = () => {
  const { id } = useParams()

  const { getWidgets } = useDashboardExtension()

  const {
    product_category,
    isLoading: categoryLoading,
    isError: categoryError,
    error,
  } = useProductCategory(id!, {
    fields: "+is_active,+is_internal",
  })

  if (categoryLoading || !product_category) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={1}
        showJSON
        showMetadata
      />
    )
  }

  if (categoryError) {
    throw error
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("product_category.details.after"),
        before: getWidgets("product_category.details.before"),
        sideAfter: getWidgets("product_category.details.side.after"),
        sideBefore: getWidgets("product_category.details.side.before"),
      }}
      data={product_category}
    >
      <TwoColumnPage.Main>
        <CategoryGeneralSection category={product_category} />
        <CategoryProductSection category={product_category} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <CategoryOrganizeSection category={product_category} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}
