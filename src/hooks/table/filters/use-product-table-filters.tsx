import { useTranslation } from "react-i18next"
import { Filter } from "../../../components/table/data-table"
import { useCollections, useProductCategories, useProductTags } from "../../api"
import { useProductTypes } from "../../api/product-types"
import { useDateTableFilters } from "./use-date-table-filters"

const excludeableFields = [
  "collections",
  "categories",
  "product_types",
  "product_tags",
  "sales_channel_id",
] as const

const SALES_CHANNEL_MOCK_OPTIONS = [
  { label: "Default Sales Channel", value: "sc_01mock" },
  { label: "Web Store", value: "sc_02mock" },
]

export const useProductTableFilters = (
  exclude?: (typeof excludeableFields)[number][]
) => {
  const { t } = useTranslation()

  const isProductTypeExcluded = exclude?.includes("product_types")

  const { product_types } = useProductTypes(
    {
      limit: 1000,
      offset: 0,
    },
    {
      enabled: !isProductTypeExcluded,
    }
  )

  const isProductTagExcluded = exclude?.includes("product_tags")

  const { product_tags } = useProductTags({
    limit: 1000,
    offset: 0,
  })

  const isCategoryExcluded = exclude?.includes("categories")

  const { product_categories } = useProductCategories(
    {
      limit: 1000,
      offset: 0,
      fields: "id,name",
    },
    {
      enabled: !isCategoryExcluded,
    }
  )

  const isCollectionExcluded = exclude?.includes("collections")

  const { product_collections: collections } = useCollections(
    {
      limit: 1000,
      offset: 0,
    },
    {
      enabled: !isCollectionExcluded,
    }
  )

  let filters: Filter[] = []

  if (product_categories && !isCategoryExcluded) {
    filters = [
      ...filters,
      {
        key: "category_id",
        label: t("fields.category"),
        type: "select",
        multiple: true,
        options: product_categories.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      },
    ]
  }

  if (collections && !isCollectionExcluded) {
    filters = [
      ...filters,
      {
        key: "collection_id",
        label: t("fields.collection"),
        type: "select",
        multiple: true,
        options: (Array.isArray(collections) ? collections : []).map((c) => ({
          label: c.title,
          value: c.id,
        })),
      },
    ]
  }

  if (product_types && !isProductTypeExcluded) {
    filters = [
      ...filters,
      {
        key: "type_id",
        label: t("fields.type"),
        type: "select",
        multiple: true,
        options: product_types.map((t) => ({
          label: t.value,
          value: t.id,
        })),
      },
    ]
  }

  if (product_tags && !isProductTagExcluded) {
    filters = [
      ...filters,
      {
        key: "tag_id",
        label: t("fields.tag"),
        type: "select",
        multiple: true,
        options: product_tags.map((t) => ({
          label: t.value,
          value: t.id,
        })),
      },
    ]
  }

  const isSalesChannelExcluded = exclude?.includes("sales_channel_id")
  if (!isSalesChannelExcluded) {
    filters = [
      ...filters,
      {
        key: "sales_channel_id",
        label: t("fields.salesChannel"),
        type: "select" as const,
        multiple: true,
        options: SALES_CHANNEL_MOCK_OPTIONS,
      },
    ]
  }

  filters = [
    ...filters,
    {
      key: "status",
      label: t("fields.status"),
      type: "select",
      multiple: true,
      options: [
        { label: t("products.productStatus.draft"), value: "draft" },
        { label: t("products.productStatus.proposed"), value: "proposed" },
        { label: t("products.productStatus.published"), value: "published" },
        { label: t("products.productStatus.rejected"), value: "rejected" },
      ],
    },
  ]

  const dateFilters = useDateTableFilters()
  filters = [...filters, ...dateFilters]

  return filters
}
