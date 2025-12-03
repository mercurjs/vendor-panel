import { useParams } from "react-router-dom"
import { RouteFocusModal } from "../../../components/modals"
import { StocksAndPricesEdit } from "./components/stocks-and-prices-edit"
import { useProduct } from "../../../hooks/api/products"
import { useStockLocations } from "../../../hooks/api"
import { useMemo } from "react"
import { useMultipleInventoryItemLevels } from "../../../hooks/api/inventory"

export const ProductEditStocksAndPrices = () => {
  const { id } = useParams()

  if (!id) {
    return null
  }

  const {
    stock_locations,
    isPending: isStockLocationsPending,
    isRefetching: isStockLocationsRefetching,
    isError: isErrorStockLocations,
    error: errorStockLocations,
    refetch: refetchStockLocations,
  } = useStockLocations({
    limit: 9999,
  })

  const {
    product,
    isPending: isProductPending,
    isRefetching: isProductRefetching,
    isError: isProductError,
    error: productError,
    refetch: refetchProduct,
  } = useProduct(id, {
    fields: "*variants,*variants.inventory_items,*categories",
  })

  const inventoryItemIds = useMemo(() => {
    if (!product || Array.isArray(product) || !product.variants) return []

    const ids: string[] = []
    product.variants.forEach((variant) => {
      variant.inventory_items?.forEach((item) => {
        ids.push(item.inventory_item_id)
      })
    })

    return ids
  }, [product])

  const {
    inventoryItemsWithLevels,
    isPending: isInventoryPending,
    isRefetching: isInventoryRefetching,
    isError: isInventoryError,
    error: inventoryError,
    refetch: refetchInventory,
  } = useMultipleInventoryItemLevels(inventoryItemIds, {
    fields: "*stock_locations",
  })

  const refetchAll = async () => {
    await Promise.all([
      refetchProduct(),
      refetchStockLocations(),
      refetchInventory(),
    ])
  }

  const isError = isProductError || isErrorStockLocations || isInventoryError
  const error = productError || errorStockLocations || inventoryError
  const isPending =
    isProductPending || isStockLocationsPending || isInventoryPending
  const isRefetching =
    isProductRefetching || isStockLocationsRefetching || isInventoryRefetching
  const ready =
    !isPending &&
    !!product &&
    !!inventoryItemsWithLevels &&
    !!stock_locations &&
    !isRefetching

  if (isError) {
    throw error
  }

  return (
    <RouteFocusModal>
      {ready && (
        <StocksAndPricesEdit
          product={product}
          inventoryItems={inventoryItemsWithLevels}
          stockLocations={stock_locations}
          productId={id!}
          isRefreshing={isRefetching}
          onRefresh={refetchAll}
        />
      )}
    </RouteFocusModal>
  )
}
