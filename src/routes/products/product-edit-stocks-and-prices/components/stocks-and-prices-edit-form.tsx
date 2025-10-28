import { HttpTypes } from "@medusajs/types"
import { useMemo } from "react"
import { UseFormReturn, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Text } from "@medusajs/ui"
import {
  DataGrid,
  createDataGridHelper,
  createDataGridPriceColumns,
} from "../../../../components/data-grid"
import { useRouteModal } from "../../../../components/modals/index"
import { usePricePreferences } from "../../../../hooks/api/price-preferences"
import { useRegions } from "../../../../hooks/api/regions.tsx"
import { useStore } from "../../../../hooks/api/store"
import { ProductCreateSchemaType } from "../../product-create/types"
import { UpdateVariantStocksSchemaType } from "../../product-edit-stocks-and-prices/schema"
import { createDataGridLocationStockColumns } from "../../../../components/data-grid/helpers"

type StocksAndPricesFormProps = {
  form: UseFormReturn<UpdateVariantStocksSchemaType>
  stockLocations: HttpTypes.AdminStockLocation[]
  product: HttpTypes.AdminProduct
}

export const StocksAndPricesEditForm = ({
  form,
  stockLocations,
  product,
}: StocksAndPricesFormProps) => {
  const { store } = useStore()
  const { regions } = useRegions({ limit: 9999 })
  const { price_preferences: pricePreferences } = usePricePreferences({})

  const { setCloseOnEscape } = useRouteModal()

  const columns = useStocksAndPricesGridColumns({
    stockLocations,
    currencies: store?.supported_currencies,
    regions,
    pricePreferences,
  })

  const variants = useWatch({
    control: form.control,
    name: "variants",
  }) as any

  const dataWithProductInfo = useMemo(() => {
    if (!variants?.length) return []

    const productInfoRow = {
      id: `product-info-${product.id}`,
      title: product.title,
      isProductInfo: true,
      prices: {},
      locations: stockLocations.map((location) => ({
        id: location.id,
        quantity: null,
        checked: false,
        disabledToggle: true,
        level_id: undefined,
      })),
    }

    return [productInfoRow, ...variants]
  }, [variants, product.title, product.id, stockLocations])

  return (
    <DataGrid
      columns={columns}
      data={dataWithProductInfo}
      state={form}
      onEditingChange={(editing) => setCloseOnEscape(!editing)}
    />
  )
}

const columnHelper = createDataGridHelper<
  HttpTypes.AdminProductVariant,
  ProductCreateSchemaType
>()

const useStocksAndPricesGridColumns = ({
  stockLocations = [],
  currencies = [],
  regions = [],
  pricePreferences = [],
}: {
  stockLocations?: HttpTypes.AdminStockLocation[]
  currencies?: HttpTypes.AdminStore["supported_currencies"]
  regions?: HttpTypes.AdminRegion[]
  pricePreferences?: HttpTypes.AdminPricePreference[]
}) => {
  const { t } = useTranslation()

  return useMemo(() => {
    return [
      columnHelper.column({
        id: t("fields.title"),
        header: t("fields.title"),
        cell: (context) => {
          const entity = context.row.original
          const isProductInfo = (entity as any).isProductInfo

          return (
            <DataGrid.ReadonlyCell context={context}>
              <div
                className={`flex items-center gap-x-2 overflow-hidden ${
                  isProductInfo
                    ? "bg-ui-bg-field text-ui-fg-disabled"
                    : "text-ui-fg-subtle"
                }`}
              >
                <Text as="span" className="truncate">
                  {entity.title}
                </Text>
              </div>
            </DataGrid.ReadonlyCell>
          )
        },
        disableHiding: true,
      }),
      ...createDataGridLocationStockColumns<
        HttpTypes.AdminProductVariant,
        ProductCreateSchemaType
      >({
        stockLocations,
        isReadyOnly: (context) => (context.row.original as any).isProductInfo,
        getFieldName: (context, stockLocationIndex) => {
          const entity = context.row.original as any
          if (entity.isProductInfo) return null
          return `variants.${context.row.index - 1}.locations.${stockLocationIndex}` as any
        },
        t,
      }),
      ...createDataGridPriceColumns<
        HttpTypes.AdminProductVariant,
        ProductCreateSchemaType
      >({
        currencies: currencies.map((c) => c.currency_code),
        regions,
        pricePreferences,
        isReadyOnly: (context) => (context.row.original as any).isProductInfo,
        getFieldName: (context, value) => {
          const entity = context.row.original as any
          if (entity.isProductInfo) return null
          return `variants.${context.row.index - 1}.prices.${value}`
        },
        t,
      }),
    ]
  }, [t, currencies, regions, pricePreferences])
}
