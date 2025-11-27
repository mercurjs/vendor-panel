import { zodResolver } from "@hookform/resolvers/zod"
import { HttpTypes } from "@medusajs/types"
import { useTranslation } from "react-i18next"
import { Button, toast } from "@medusajs/ui"
import { castNumber } from "../../../../lib/cast-number"
import { RouteFocusModal } from "../../../../components/modals"
import { KeyboundForm } from "../../../../components/utilities/keybound-form"
import { useForm } from "react-hook-form"
import { StocksAndPricesEditForm } from "./stocks-and-prices-edit-form.tsx"
import { useUpdateProductVariantsBatch } from "../../../../hooks/api/products.tsx"
import { useBatchInventoryItemsLocationLevels } from "../../../../hooks/api/inventory.tsx"
import { InventoryItemWithLevels } from "../../../../types/inventory"
import {
  UpdateVariantStocksSchemaType,
  UpdateVariantStocksSchema,
} from "../schema"

type StocksAndPricesEditProps = {
  product: any
  inventoryItems: InventoryItemWithLevels[]
  stockLocations: HttpTypes.AdminStockLocation[]
  productId: string
  isRefreshing?: boolean
  onRefresh?: () => Promise<void>
}

const createFormValues = (
  product: any,
  stockLocations: HttpTypes.AdminStockLocation[],
  inventoryItems: InventoryItemWithLevels[]
) => {
  if (!product?.variants) return { variants: [] }

  const data = product.variants.reduce(
    (acc: any[], variant: HttpTypes.AdminProductVariant) => {
      const prices =
        variant.prices?.reduce((acc: Record<string, number>, price) => {
          acc[price.currency_code] = price.amount
          return acc
        }, {}) || {}

      const locations =
        stockLocations?.map((location) => {
          const value = inventoryItems
            ?.find(
              (item) =>
                item.inventory_item_id ===
                variant.inventory_items?.[0]?.inventory_item_id
            )
            ?.location_levels?.find(
              (level) => level.location_id === location.id
            )

          return {
            id: location.id,
            level_id: value?.id,
            quantity:
              typeof value?.stocked_quantity === "number"
                ? value.stocked_quantity
                : null,
            checked: !!value,
            disabledToggle: false,
          }
        }) || []

      const data = {
        id: variant.id,
        title: variant.title,
        inventory_item_id: variant.inventory_items?.[0]?.inventory_item_id,
        prices,
        locations,
      }
      acc.push(data)
      return acc
    },
    []
  )
  return { variants: data }
}
const getPricesPayload = (
  variants: UpdateVariantStocksSchemaType["variants"]
) => {
  return variants
    .filter((variant) => Object.keys(variant.prices || {}).length)
    .map((variant) => {
      const prices = Object.entries(variant.prices || {})
        .filter(
          ([_, amount]) =>
            amount !== null && amount !== undefined && amount !== ""
        )
        .map(([currency_code, amount]) => ({
          currency_code,
          amount: typeof amount === "string" ? parseFloat(amount) : amount,
        }))

      return {
        id: variant.id,
        prices,
      }
    })
}

const getInventoryLocationLevelsPayload = (
  variants: UpdateVariantStocksSchemaType["variants"]
) => {
  const payload: HttpTypes.AdminBatchInventoryItemsLocationLevels = {
    create: [],
    update: [],
    delete: [],
    force: true,
  }

  variants.forEach((variant) => {
    variant.locations?.forEach(({ checked, level_id, quantity, id }) => {
      if (!level_id && checked) {
        payload.create.push({
          inventory_item_id: variant.inventory_item_id as string,
          location_id: id,
          stocked_quantity: quantity ? castNumber(quantity) : 0,
        })
      } else if (level_id && !checked) {
        payload.delete.push(level_id)
      } else if (level_id && checked) {
        payload.update.push({
          inventory_item_id: variant.inventory_item_id as string,
          location_id: id,
          stocked_quantity: quantity ? castNumber(quantity) : 0,
        })
      }
    })
  })
  return payload
}

export const StocksAndPricesEdit = ({
  product,
  inventoryItems,
  stockLocations,
  productId,
  isRefreshing,
  onRefresh,
}: StocksAndPricesEditProps) => {
  const { t } = useTranslation()
  const form = useForm<UpdateVariantStocksSchemaType>({
    defaultValues: createFormValues(product, stockLocations, inventoryItems),
    resolver: zodResolver(UpdateVariantStocksSchema, {}),
  })

  const updateVariantsBatch = useUpdateProductVariantsBatch(productId)
  const updateInventoryLocationLevels = useBatchInventoryItemsLocationLevels()

  const handleSave = form.handleSubmit(async (data) => {
    try {
      const pricesPayload = getPricesPayload(data.variants)
      const inventoryPayload = getInventoryLocationLevelsPayload(data.variants)

      const promises = [
        updateVariantsBatch.mutateAsync(pricesPayload),
        updateInventoryLocationLevels.mutateAsync(inventoryPayload),
      ]

      await Promise.all(promises)

      toast.success(t("products.variants.editStocksAndPrices.successToast"))

      await onRefresh?.()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  })

  const isLoading =
    updateVariantsBatch.isPending || updateInventoryLocationLevels.isPending

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm onSubmit={handleSave} className="flex size-full flex-col">
        <RouteFocusModal.Header>
          <RouteFocusModal.Title asChild>
            <span className="sr-only">
              {t("products.variants.editStocksAndPrices.header")}
            </span>
          </RouteFocusModal.Title>
          <RouteFocusModal.Description asChild>
            <span className="sr-only">
              {t("products.variants.editStocksAndPrices.description")}
            </span>
          </RouteFocusModal.Description>
        </RouteFocusModal.Header>
        <RouteFocusModal.Body className="flex flex-col overflow-hidden">
          {isRefreshing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75" />
          )}
          <StocksAndPricesEditForm
            form={form}
            stockLocations={stockLocations}
            product={product}
          />
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <div className="flex w-full items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button
              type="submit"
              variant="primary"
              size="small"
              isLoading={isLoading}
            >
              {t("actions.save")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
