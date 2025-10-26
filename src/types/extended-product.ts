import { HttpTypes } from "@medusajs/types"

export type ExtendedAdminProduct = Omit<HttpTypes.AdminProduct, 'variants'> & {
  thumbnail: string
  images: Array<HttpTypes.AdminProductImage & { url: string }>
  attribute_values?: Array<{
    id: string
    value: string
    rank: number
    metadata: Record<string, unknown> | null
    attribute_id: string
    attribute: {
      id: string
      name: string
      description: string | null
      is_required: boolean
      is_filterable: boolean
      handle: string
      metadata: Record<string, unknown>
      ui_component: string
      created_at: string
      updated_at: string
      deleted_at: string | null
    }
    created_at: string
    updated_at: string
    deleted_at: string | null
  }>
  variants?: ExtendedAdminProductVariant[]
}

export type ExtendedAdminProductResponse = Omit<
  HttpTypes.AdminProductResponse,
  "product"
> & {
  product: ExtendedAdminProduct
}

export type ExtendedAdminProductListResponse = Omit<
  HttpTypes.AdminProductListResponse,
  "products"
> & {
  products: ExtendedAdminProduct[]
}

export type ExtendedAdminPrice = HttpTypes.AdminPrice & {
  rules?: {
    region_id?: string
    [key: string]: unknown
  }
}

export type ExtendedAdminProductVariantInventoryItemLink =
  HttpTypes.AdminProductVariantInventoryItemLink & {
    required_quantity: number
  }

export type ExtendedAdminProductVariant = Omit<
  HttpTypes.AdminProductVariant,
  "prices" | "inventory_items"
> & {
  prices?: ExtendedAdminPrice[] | null
  inventory_items?: ExtendedAdminProductVariantInventoryItemLink[] | null
  inventory?: HttpTypes.AdminInventoryItem[] | null
}

export type ExtendedAdminProductWithVariants = Omit<
  ExtendedAdminProduct,
  "variants"
> & {
  variants?: ExtendedAdminProductVariant[]
}

/**
 * Union type for product stock grid rows
 * Can be either a variant (parent row) or an inventory item link (child row)
 */
export type ProductStockGridRow =
  | ExtendedAdminProductVariant
  | HttpTypes.AdminProductVariantInventoryItemLink

