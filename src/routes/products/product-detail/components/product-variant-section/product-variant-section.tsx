import { Buildings, Component, PencilSquare, Trash } from "@medusajs/icons"
import { ExtendedAdminProduct, ExtendedAdminProductVariant } from "../../../../../types/products"
import {
  Badge,
  clx,
  Container,
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  createDataTableFilterHelper,
  DataTableAction,
  Tooltip,
  usePrompt,
} from "@medusajs/ui"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { CellContext } from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import { DataTable } from "../../../../../components/data-table"
import { useDataTableDateColumns } from "../../../../../components/data-table/helpers/general/use-data-table-date-columns"
import { useDataTableDateFilters } from "../../../../../components/data-table/helpers/general/use-data-table-date-filters"
import { useDeleteVariantLazy } from "../../../../../hooks/api/products"
import { PRODUCT_VARIANT_IDS_KEY } from "../../../common/constants"
import { useInventoryItemLevels } from "../../../../../hooks/api"

type ProductVariantSectionProps = {
  product: ExtendedAdminProduct
}

const PAGE_SIZE = 10

export const ProductVariantSection = ({
  product,
}: ProductVariantSectionProps) => {
  const { t } = useTranslation()

  const columns = useColumns(product)
  const filters = useFilters()
  const commands = useCommands()

  const { variants } = product

  const count = variants ? variants?.length : 0

  return (
    <Container className="divide-y p-0">
      <DataTable
        data={variants || undefined}
        columns={columns}
        filters={filters}
        rowCount={count}
        getRowId={(row) => row.id}
        pageSize={PAGE_SIZE}
        heading={t("products.variants.header")}
        rowHref={(row) => `variants/${row.id}`}
        emptyState={{
          empty: {
            heading: t("products.variants.empty.heading"),
            description: t("products.variants.empty.description"),
          },
          filtered: {
            heading: t("products.variants.filtered.heading"),
            description: t("products.variants.filtered.description"),
          },
        }}
        actionMenu={{
          groups: [
            {
              actions: [
                {
                  label: t("products.variants.editStocksAndPrices.header"),
                  to: `edit-stocks-and-prices`,
                  icon: <PencilSquare />,
                },
              ],
            },
          ],
        }}
        action={{
          label: t("actions.create"),
          to: `variants/create`,
        }}
        commands={commands}
      />
    </Container>
  )
}

const columnHelper =
  createDataTableColumnHelper<ExtendedAdminProductVariant>()

const useColumns = (product: ExtendedAdminProduct) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutateAsync } = useDeleteVariantLazy(product.id)
  const prompt = usePrompt()

  const dateColumns = useDataTableDateColumns<ExtendedAdminProductVariant>()

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      const res = await prompt({
        title: t("general.areYouSure"),
        description: t("products.deleteVariantWarning", {
          title,
        }),
        confirmText: t("actions.delete"),
        cancelText: t("actions.cancel"),
      })

      if (!res) {
        return
      }

      await mutateAsync({ variantId: id })
    },
    [mutateAsync, prompt, t]
  )

  const optionColumns = useMemo(() => {
    if (!product?.options) {
      return []
    }

    return product.options.map((option) => {
      return columnHelper.display({
        id: option.id,
        header: option.title,
        cell: ({ row }) => {
          const variantOpt = row.original.options?.find(
            (opt) => opt.option_id === option.id
          )

          if (!variantOpt) {
            return <span className="text-ui-fg-muted">-</span>
          }

          return (
            <div className="flex items-center">
              <Tooltip content={variantOpt.value}>
                <Badge
                  size="2xsmall"
                  title={variantOpt.value}
                  className="inline-flex min-w-[20px] max-w-[140px] items-center justify-center overflow-hidden truncate"
                >
                  {variantOpt.value}
                </Badge>
              </Tooltip>
            </div>
          )
        },
      })
    })
  }, [product])

  const getActions = useCallback(
    (ctx: CellContext<ExtendedAdminProductVariant, unknown>) => {
      const variant = ctx.row.original

      const mainActions: DataTableAction<ExtendedAdminProductVariant>[] = [
        {
          icon: <PencilSquare />,
          label: t("actions.edit"),
          onClick: (row) => {
            navigate(`edit-variant?variant_id=${row.row.original.id}`)
          },
        },
      ]

      const secondaryActions: DataTableAction<ExtendedAdminProductVariant>[] =
        [
          {
            icon: <Trash />,
            label: t("actions.delete"),
            onClick: () => handleDelete(variant.id, variant.title!),
          },
        ]

      const inventoryItemsCount = variant.inventory_items?.length || 0

      switch (inventoryItemsCount) {
        case 0:
          break
        case 1: {
          const inventoryItemLink = `/inventory/${
            variant.inventory_items![0].inventory_item_id
          }`

          mainActions.push({
            label: t("products.variant.inventory.actions.inventoryItems"),
            onClick: () => {
              navigate(inventoryItemLink)
            },
            icon: <Buildings />,
          })
          break
        }
        default: {
          const ids = variant.inventory_items?.map((i) => i.inventory?.id)

          if (!ids || ids.length === 0) {
            break
          }

          const inventoryKitLink = `/inventory?${new URLSearchParams({
            id: ids.join(","),
          }).toString()}`

          mainActions.push({
            label: t("products.variant.inventory.actions.inventoryKit"),
            onClick: () => {
              navigate(inventoryKitLink)
            },
            icon: <Component />,
          })
        }
      }

      return [mainActions, secondaryActions]
    },
    [handleDelete, navigate, t]
  )

  const getInventory = useCallback(
    (variant: ExtendedAdminProductVariant) => {
      const inventoryItems = variant.inventory_items
        ?.map((i) => i.inventory)
        .filter(Boolean)

      const hasInventoryKit = inventoryItems ? inventoryItems.length > 1 : false

      const locations: Record<string, boolean> = {}

      inventoryItems?.forEach((i) => {
        i?.location_levels?.forEach((l) => {
          locations[l.id] = true
        })
      })

      const { location_levels } = useInventoryItemLevels(
        variant?.inventory_items?.[0]?.inventory_item_id!
      )

      const quantity =
        location_levels?.reduce(
          (acc, curr) => acc + curr.available_quantity,
          0
        ) || 0
      const locationCount =
        location_levels?.reduce(
          (acc, curr) => acc + curr.stock_locations?.length,
          0
        ) || 0

      const text = hasInventoryKit
        ? t("products.variant.tableItemAvailable", {
            availableCount: quantity,
          })
        : t("products.variant.tableItem", {
            availableCount: quantity,
            locationCount,
            count: locationCount,
          })

      return { text, hasInventoryKit, quantity }
    },
    [t]
  )

  return useMemo(() => {
    return [
      columnHelper.accessor("title", {
        header: t("fields.title"),
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      columnHelper.accessor("sku", {
        header: t("fields.sku"),
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
      }),
      ...optionColumns,
      columnHelper.display({
        id: "inventory",
        header: t("fields.inventory"),
        cell: ({ row }) => {
          const { text, hasInventoryKit, quantity } = getInventory(row.original)

          return (
            <Tooltip content={text}>
              <div className="flex h-full w-full items-center gap-2 overflow-hidden">
                {hasInventoryKit && <Component />}
                <span
                  className={clx("truncate", {
                    "text-ui-fg-error": !quantity,
                  })}
                >
                  {text}
                </span>
              </div>
            </Tooltip>
          )
        },
        maxSize: 250,
      }),
      columnHelper.action({
        actions: getActions,
      }),
    ]
  }, [t, optionColumns, dateColumns, getActions, getInventory])
}

const filterHelper =
  createDataTableFilterHelper<ExtendedAdminProductVariant>()

const useFilters = () => {
  const { t } = useTranslation()
  const dateFilters = useDataTableDateFilters()

  return useMemo(() => {
    return [
      filterHelper.accessor("allow_backorder", {
        type: "radio",
        label: t("fields.allowBackorder"),
        options: [
          { label: t("filters.radio.yes"), value: "true" },
          { label: t("filters.radio.no"), value: "false" },
        ],
      }),
      filterHelper.accessor("manage_inventory", {
        type: "radio",
        label: t("fields.manageInventory"),
        options: [
          { label: t("filters.radio.yes"), value: "true" },
          { label: t("filters.radio.no"), value: "false" },
        ],
      }),
      ...dateFilters,
    ]
  }, [t, dateFilters])
}

const commandHelper = createDataTableCommandHelper()

const useCommands = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return [
    commandHelper.command({
      label: t("inventory.stock.action"),
      shortcut: "i",
      action: async (selection) => {
        navigate(
          `stock?${PRODUCT_VARIANT_IDS_KEY}=${Object.keys(selection).join(",")}`
        )
      },
    }),
  ]
}
