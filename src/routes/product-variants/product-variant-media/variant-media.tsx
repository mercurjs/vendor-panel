import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { RouteFocusModal } from '../../../components/modals';
import { useProduct, useProductVariants } from '../../../hooks/api/products';
import { getExplicitVariantImages } from '../../../utils/get-explicit-variant-images';
import { VariantMediaView } from './components/variant-media-view';

export const VariantMedia = () => {
  const { t } = useTranslation();
  const { id, variant_id } = useParams();

  const {
    product,
    isLoading: isProductLoading,
    isError,
    error
  } = useProduct(id!, {
    fields: '*images'
  });

  const { variants, isLoading: isVariantsLoading } = useProductVariants(id!, {
    fields: '*images'
  } as any);

  if (isError) {
    throw error;
  }

  const variant = variants?.find(v => v.id === variant_id);
  const isLoading = isProductLoading || isVariantsLoading;
  const ready = !isLoading && !!variant && !!product;

  const variantImages = useMemo(() => {
    if (!variant?.images) {
      return [];
    }

    return getExplicitVariantImages(variant.images, variant_id!);
  }, [variant?.images, variant_id]);

  return (
    <RouteFocusModal>
      <RouteFocusModal.Title asChild>
        <span className="sr-only">{t('products.media.label')}</span>
      </RouteFocusModal.Title>
      <RouteFocusModal.Description asChild>
        <span className="sr-only">{t('products.media.editHint')}</span>
      </RouteFocusModal.Description>
      {ready && (
        <VariantMediaView
          productId={id!}
          variantId={variant_id!}
          variantImages={variantImages}
          productImages={product.images ?? []}
          thumbnail={variant.thumbnail ?? null}
        />
      )}
    </RouteFocusModal>
  );
};
