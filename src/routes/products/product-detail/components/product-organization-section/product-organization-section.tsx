import { PencilSquare } from "@medusajs/icons"
import { Badge, Container, Heading, Tooltip } from "@medusajs/ui"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { SectionRow } from "../../../../../components/common/section"
import { useProductCategories } from "../../../../../hooks/api/categories"
import { useDashboardExtension } from "../../../../../extensions"
import { ExtendedAdminProduct } from "../../../../../types/products"

type ProductOrganizationSectionProps = {
  product: ExtendedAdminProduct
}

type ProductAdditionalData = {
  secondary_categories?: Array<{
    handle?: string
    secondary_categories_ids?: string[]
  }>
}

const flattenCategories = (categories: any[] = []) => {
  const result: Array<{ id: string; name: string }> = []
  categories.forEach((category) => {
    if (category?.id && category?.name) {
      result.push({ id: category.id, name: category.name })
    }
    if (Array.isArray(category?.category_children)) {
      result.push(...flattenCategories(category.category_children))
    }
  })
  return result
}

export const ProductOrganizationSection = ({
  product,
}: ProductOrganizationSectionProps) => {
  const { t } = useTranslation()
  const { getDisplays } = useDashboardExtension()

  const additionalSecondaryCategoryIds = useMemo(() => {
    const additionalData = (product as ExtendedAdminProduct & {
      additional_data?: ProductAdditionalData
    }).additional_data

    const ids =
      additionalData?.secondary_categories?.flatMap(
        (entry) => entry.secondary_categories_ids ?? []
      ) ?? []

    return Array.from(new Set(ids))
  }, [product])

  const { product_categories: allCategories } = useProductCategories(
    { include_descendants_tree: true },
    {
      enabled: additionalSecondaryCategoryIds.length > 0 && !product.secondary_categories?.length,
    }
  )

  const secondaryCategoriesForDisplay = useMemo(() => {
    if (product.secondary_categories?.length) {
      return product.secondary_categories.map((category: any) => ({
        id: category.id,
        name: category.name,
      }))
    }

    if (!additionalSecondaryCategoryIds.length || !allCategories) {
      return []
    }

    const flattenedCategories = flattenCategories(allCategories)
    return additionalSecondaryCategoryIds
      .map((id) => flattenedCategories.find((category) => category.id === id))
      .filter(Boolean) as Array<{ id: string; name: string }>
  }, [product.secondary_categories, additionalSecondaryCategoryIds, allCategories])

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("products.organization.header")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: "organization",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
        />
      </div>

      <SectionRow
        title={t("fields.tags")}
        value={
          !!product.tags?.length
            ? product.tags.map((tag) => (
              <OrganizationTag
                key={tag.id}
                label={tag.value}
                to={`/settings/product-tags/${tag.id}`}
              />
            ))
            : undefined
        }
      />
      <SectionRow
        title={t("fields.type")}
        value={
          product.type ? (
            <OrganizationTag
              label={product.type.value}
              to={`/settings/product-types/${product.type_id}`}
            />
          ) : undefined
        }
      />

      <SectionRow
        title={t("products.fields.primaryCategory.label")}
        value={
          !!product.categories?.length
            ? product.categories.map((pcat) => (
              <OrganizationTag
                key={pcat.id}
                label={pcat.name}
                to={`/categories/${pcat.id}`}
              />
            ))
            : undefined
        }
      />
      <SectionRow
        title={t("products.fields.secondaryCategories.label")}
        value={
          !!secondaryCategoriesForDisplay.length
            ? secondaryCategoriesForDisplay.map((secondaryCategory) => (
              <OrganizationTag
                key={secondaryCategory.id}
                label={secondaryCategory.name}
                to={`/categories/${secondaryCategory.id}`}
              />
            ))
            : undefined
        }
      />
      <SectionRow
        title={t("fields.collection")}
        value={
          product.collection ? (
            <OrganizationTag
              label={product.collection.title}
              to={`/collections/${product.collection.id}`}
            />
          ) : undefined
        }
      />


      {getDisplays("product", "organize").map((Component, i) => {
        return <Component key={i} data={product} />
      })}
    </Container>
  )
}

const OrganizationTag = ({ label, to }: { label: string; to: string }) => {
  return (
    <Tooltip content={label}>
      <Badge size="2xsmall" className="block w-fit truncate" asChild>
        <Link to={to}>{label}</Link>
      </Badge>
    </Tooltip>
  )
}
