import { PencilSquare } from "@medusajs/icons"
import { Badge, Container, Heading, Tooltip } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { SectionRow } from "../../../../../components/common/section"
import { useDashboardExtension } from "../../../../../extensions"
import { AdminProductWithAttributes } from "../../../../../types/products"
import { useProductCategories } from "../../../../../hooks/api/categories"

type ProductOrganizationSectionProps = {
  product: AdminProductWithAttributes
}

export const ProductOrganizationSection = ({
  product,
}: ProductOrganizationSectionProps) => {
  const { t } = useTranslation()
  const { getDisplays } = useDashboardExtension()

  // Fetch ALL categories and then filter to show only secondary ones
  const { product_categories: allCategories } = useProductCategories()
  
  const primaryCategory = product.categories?.[0]
  const primaryCategoryId = primaryCategory?.id
  const secondaryCategoryIds = product.secondary_categories
    ?.map((sc) => sc.category_id)
    .filter((id) => id !== primaryCategoryId) || []
  
  // Filter fetched categories to only include those in secondaryCategoryIds
  const secondaryCategories = allCategories?.filter((cat) =>
    secondaryCategoryIds.includes(cat.id)
  )

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("products.organization.header")}</Heading>
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
          product.tags?.length
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

      <SectionRow
        title={t("products.fields.primaryCategory.label")}
        value={
          primaryCategory ? (
            <OrganizationTag
              label={primaryCategory.name}
              to={`/categories/${primaryCategory.id}`}
            />
          ) : undefined
        }
      />

      <SectionRow
        title={t("products.fields.secondaryCategories.label")}
        value={
          secondaryCategories?.length
            ? secondaryCategories.map((category: any) => (
                <OrganizationTag
                  key={category.id}
                  label={category.name}
                  to={`/categories/${category.id}`}
                />
              ))
            : undefined
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
