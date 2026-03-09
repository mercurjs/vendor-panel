import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { RouteFocusModal } from '../../../components/modals';
import { useProduct } from '../../../hooks/api/products';
import { VariantMediaView } from './components/variant-media-view';

export const VariantMedia = () => {
  const { t } = useTranslation();
  const { id, variant_id } = useParams();

  const { product, isLoading, isError, error } = useProduct(id!, {
    fields: '*variants.images,*images'
  });

  if (isError) {
    throw error;
  }

  const variant = product?.variants?.find(v => v.id === variant_id);
  const ready = !isLoading && !!variant;

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
          variantImages={variant.images ?? []}
          productImages={product!.images ?? []}
          thumbnail={variant.thumbnail ?? null}
        />
      )}
    </RouteFocusModal>
  );
};
