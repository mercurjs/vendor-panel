import imagesConverter from "./images-conventer"
import { HttpTypes } from "@medusajs/types"
import { ExtendedAdminProduct } from "../types/extended-product"

function formatProductImages(
  images: HttpTypes.AdminProductImage[] | null | undefined
) {
  if (!images) {
    return []
  }

  return images.map((image) => ({
    ...image,
    url: imagesConverter(image.url || ""),
  }))
}

function formatSingleProduct(product: ExtendedAdminProduct) {
  return {
    ...product,
    thumbnail: imagesConverter(product.thumbnail || ""),
    images: formatProductImages(product.images),
  }
}

function productsImagesFormatter(
  products: ExtendedAdminProduct[] | ExtendedAdminProduct | undefined
): ExtendedAdminProduct[] | ExtendedAdminProduct | null {
  if (!products) {
    return null
  }

  if (Array.isArray(products)) {
    return products.map(formatSingleProduct)
  }

  return formatSingleProduct(products)
}

export default productsImagesFormatter
