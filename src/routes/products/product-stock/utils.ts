import { HttpTypes } from "@medusajs/types"
import {
  ExtendedAdminProductVariant,
  ProductStockGridRow,
} from "../../../types/products"

export function isProductVariant(
  row: ProductStockGridRow
): row is ExtendedAdminProductVariant {
  return row.id.startsWith("variant_")
}

export function isProductVariantWithInventoryPivot(
  row: ProductStockGridRow
): row is ExtendedAdminProductVariant & {
  inventory_items: HttpTypes.AdminProductVariantInventoryItemLink[]
} {
  return (
    "inventory_items" in row &&
    Array.isArray(row.inventory_items) &&
    row.inventory_items.length > 0
  )
}

export function getDisabledInventoryRows(
  variants: ExtendedAdminProductVariant[]
) {
  const seen: Record<string, ExtendedAdminProductVariant> = {}
  const disabled: Record<string, { id: string; title: string; sku: string }> =
    {}

  variants?.forEach((variant) => {
    const inventoryItems = variant.inventory_items

    if (!inventoryItems) {
      return
    }

    inventoryItems.forEach((item) => {
      const existing = seen[item.inventory_item_id]

      if (existing) {
        disabled[item.inventory_item_id] = {
          id: existing.id,
          title: existing.title || "",
          sku: existing.sku || "",
        }

        return
      }

      seen[item.inventory_item_id] = variant
    })
  })

  return disabled
}
