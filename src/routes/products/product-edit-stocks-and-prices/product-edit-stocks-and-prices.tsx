import { useMemo } from 'react';

import { useParams } from 'react-router-dom';

import { RouteFocusModal } from '../../../components/modals';
import { useStockLocations } from '../../../hooks/api';
import { useMultipleInventoryItemLevels } from '../../../hooks/api/inventory';
import { useProduct } from '../../../hooks/api/products';
import { StocksAndPricesEdit } from './components/stocks-and-prices-edit';

export const ProductEditStocksAndPrices = () => {
  const { id } = useParams();

  if (!id) {
    return null;
  }

  const {
    stock_locations,
    isPending: isStockLocationsPending,
    isError: isErrorStockLocations,
    error: errorStockLocations
  } = useStockLocations({
    limit: 9999
  });

  const {
    product,
    isPending: isProductPending,
    isError: isProductError,
    error: productError
  } = useProduct(id, {
    fields: '*variants,*variants.inventory_items,*categories'
  });

  const inventoryItemIds = useMemo(() => {
    if (!product || Array.isArray(product) || !product.variants) return [];

    const ids: string[] = [];
    product.variants.forEach(variant => {
      variant.inventory_items?.forEach(item => {
        ids.push(item.inventory_item_id);
      });
    });

    return ids;
  }, [product]);

  const {
    inventoryItemsWithLevels,
    isPending: isInventoryPending,
    isError: isInventoryError,
    error: inventoryError
  } = useMultipleInventoryItemLevels(inventoryItemIds, {
    fields: '*stock_locations'
  });

  const isError = isProductError || isErrorStockLocations || isInventoryError;
  const error = productError || errorStockLocations || inventoryError;
  const isPending = isProductPending || isStockLocationsPending || isInventoryPending;
  const ready = !isPending && !!product && !!inventoryItemsWithLevels && !!stock_locations;

  if (isError) {
    throw error;
  }

  return (
    <RouteFocusModal>
      {ready && (
        <StocksAndPricesEdit
          product={product}
          inventoryItems={inventoryItemsWithLevels}
          stockLocations={stock_locations}
          productId={id!}
        />
      )}
    </RouteFocusModal>
  );
};
