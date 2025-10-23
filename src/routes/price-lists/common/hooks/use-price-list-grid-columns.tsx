import { HttpTypes } from "@medusajs/types"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Thumbnail } from "../../../../components/common/thumbnail"
import {
  createDataGridHelper,
  DataGrid,
} from "../../../../components/data-grid"
import { createDataGridPriceColumns } from "../../../../components/data-grid/helpers/create-data-grid-price-columns"
import { PricingCreateSchemaType } from "../../price-list-create/components/price-list-create-form/schema"
import { isProductRow } from "../utils"
import { ExtendedAdminProduct, ExtendedAdminProductVariant } from "../../../../types/extended-product"

const columnHelper = createDataGridHelper<
 ExtendedAdminProduct | ExtendedAdminProductVariant,
  PricingCreateSchemaType
>()

export const usePriceListGridColumns = ({
  currencies = [],
  regions = [],
  pricePreferences = [],
}: {
  currencies?: HttpTypes.AdminStoreCurrency[]
  regions?: HttpTypes.AdminRegion[]
  pricePreferences?: HttpTypes.AdminPricePreference[]
}) => {
  const { t } = useTranslation()

  const colDefs: ColumnDef<
    ExtendedAdminProduct | ExtendedAdminProductVariant
  >[] = useMemo(() => {
    return [
      columnHelper.column({
        id: t("fields.title"),
        header: t("fields.title"),
        cell: (context) => {
          const entity = context.row.original
          if (isProductRow(entity)) {
            return (
              <DataGrid.ReadonlyCell context={context}>
                <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
                  <Thumbnail src={entity.thumbnail} size="small" />
                  <span className="truncate">{entity.title}</span>
                </div>
              </DataGrid.ReadonlyCell>
            )
          }

          return (
            <DataGrid.ReadonlyCell context={context} color="normal">
              <div className="flex h-full w-full items-center gap-x-2 overflow-hidden">
                <span className="truncate">{entity.title}</span>
              </div>
            </DataGrid.ReadonlyCell>
          )
        },
        disableHiding: true,
      }),
      ...createDataGridPriceColumns<
        ExtendedAdminProduct | ExtendedAdminProductVariant,
        PricingCreateSchemaType
      >({
        currencies: currencies.map((c) => c.currency_code),
        pricePreferences,
        isReadyOnly: (context) => {
          const entity = context.row.original
          return isProductRow(entity)
        },
        getFieldName: (context, value) => {
          const entity = context.row.original

          if (isProductRow(entity)) {
            return null
          }

          if (context.column.id?.startsWith("currency_prices")) {
            return `products.${entity.product_id}.variants.${entity.id}.currency_prices.${value}.amount`
          }

          return `products.${entity.product_id}.variants.${entity.id}.region_prices.${value}.amount`
        },
        t,
      }),
    ]
  }, [t, currencies, regions, pricePreferences])

  return colDefs
}
