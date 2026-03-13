import { useMemo } from 'react';

import { useParams } from 'react-router-dom';

import { TwoColumnPageSkeleton } from '../../../components/common/skeleton';
import { TwoColumnPage } from '../../../components/layout/pages';
import { useDashboardExtension } from '../../../extensions';
import { useProduct, useProductVariants } from '../../../hooks/api/products';
import { getExplicitVariantImages } from '../../../utils/get-explicit-variant-images';
import { VariantGeneralSection } from './components/variant-general-section';
import {
  InventorySectionPlaceholder,
  VariantInventorySection
} from './components/variant-inventory-section';
import { VariantMediaSection } from './components/variant-media-section';
import { VariantPricesSection } from './components/variant-prices-section';

export const ProductVariantDetail = () => {
  const { id, variant_id } = useParams();
  const {
    product,
    isLoading: isProductLoading,
    isError,
    error
  } = useProduct(id!, {
    fields: '*variants.inventory_items,*images'
  });

  const { variants, isLoading: isVariantsLoading } = useProductVariants(id!, {
    fields: '*images'
  } as any);

  const productVariant = product?.variants?.find(item => item.id === variant_id);
  const variantsDataVariant = variants?.find(v => v.id === variant_id);

  const variantImages = useMemo(() => {
    if (!variantsDataVariant?.images) {
      return [];
    }

    return getExplicitVariantImages(variantsDataVariant.images, variant_id!);
  }, [variantsDataVariant?.images, variant_id]);

  const { getWidgets } = useDashboardExtension();

  const isLoading = isProductLoading || isVariantsLoading;

  if (isLoading || !productVariant) {
    return (
      <TwoColumnPageSkeleton
        mainSections={2}
        sidebarSections={1}
      />
    );
  }

  if (isError) {
    throw error;
  }

  return (
    <TwoColumnPage
      data={productVariant}
      hasOutlet
      widgets={{
        after: getWidgets('product_variant.details.after'),
        before: getWidgets('product_variant.details.before'),
        sideAfter: getWidgets('product_variant.details.side.after'),
        sideBefore: getWidgets('product_variant.details.side.before')
      }}
    >
      <TwoColumnPage.Main>
        <VariantGeneralSection variant={productVariant} />
        <VariantMediaSection
          variant={productVariant}
          variantImages={variantImages}
          productId={id!}
        />
        {!productVariant.manage_inventory ? (
          <InventorySectionPlaceholder />
        ) : (
          productVariant.inventory_items && (
            <VariantInventorySection
              inventoryItems={productVariant.inventory_items.map(i => {
                return {
                  id: i.inventory_item_id,
                  required_quantity: i.required_quantity,
                  variant: productVariant
                };
              })}
            />
          )
        )}
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <VariantPricesSection variant={productVariant} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
