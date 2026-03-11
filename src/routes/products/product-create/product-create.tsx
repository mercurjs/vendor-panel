import React from 'react';

import { useTranslation } from 'react-i18next';

import { RouteFocusModal, StackedFocusModal, useStackedModal } from '../../../components/modals';
import { useSalesChannels } from '../../../hooks/api';
import { useStore } from '../../../hooks/api/store';
import { ProductCreateForm } from './components/product-create-form/product-create-form';
import { VariantMediaView } from './components/variant-media-view/variant-media-view';

type MediaItem = {
  file?: File;
  url?: string;
  isThumbnail?: boolean;
  id?: string;
};

export const ProductCreate = () => {
  const { t } = useTranslation();

  const { store, isPending: isStorePending } = useStore();

  const { sales_channels, isPending: isSalesChannelPending } = useSalesChannels();

  const ready = !!store && !isStorePending && !!sales_channels && !isSalesChannelPending;

  return (
    <RouteFocusModal>
      <RouteFocusModal.Title asChild>
        <span className="sr-only">{t('products.create.title')}</span>
      </RouteFocusModal.Title>
      <RouteFocusModal.Description asChild>
        <span className="sr-only">{t('products.create.description')}</span>
      </RouteFocusModal.Description>
      {ready && (
        <ProductCreateFormWithModal
          defaultChannel={sales_channels[0]}
          store={store}
        />
      )}
    </RouteFocusModal>
  );
};

const ProductCreateFormWithModal = ({
  defaultChannel,
  store
}: {
  defaultChannel: any;
  store: any;
}) => {
  const { setIsOpen } = useStackedModal();
  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState<number | null>(null);
  const [selectedVariantTitle, setSelectedVariantTitle] = React.useState<string | undefined>(
    undefined
  );
  const [selectedVariantMedia, setSelectedVariantMedia] = React.useState<MediaItem[] | undefined>(
    undefined
  );
  const [productMedia, setProductMedia] = React.useState<MediaItem[]>([]);
  const saveVariantMediaRef = React.useRef<
    ((variantIndex: number, media: MediaItem[]) => void) | null
  >(null);

  const handleOpenMediaModal = React.useCallback(
    (
      variantIndex: number,
      variantTitle?: string,
      initialMedia?: MediaItem[],
      currentProductMedia?: MediaItem[]
    ) => {
      setSelectedVariantIndex(variantIndex);
      setSelectedVariantTitle(variantTitle);
      setSelectedVariantMedia(initialMedia);
      setProductMedia(currentProductMedia || []);
      setIsOpen('variant-media-modal', true);
    },
    []
  );

  const handleCloseModal = () => {
    setIsOpen('variant-media-modal', false);
    setSelectedVariantIndex(null);
    setSelectedVariantTitle(undefined);
    setSelectedVariantMedia(undefined);
    setProductMedia([]);
  };

  const handleSaveMedia = React.useCallback((variantIndex: number, media: MediaItem[]) => {
    if (saveVariantMediaRef.current) {
      saveVariantMediaRef.current(variantIndex, media);
    }
    handleCloseModal();
  }, []);

  return (
    <>
      <ProductCreateForm
        defaultChannel={defaultChannel}
        store={store}
        onOpenMediaModal={handleOpenMediaModal}
        onSaveVariantMediaRef={saveVariantMediaRef}
      />

      <StackedFocusModal
        id="variant-media-modal"
        onOpenChangeCallback={open => {
          if (!open) {
            handleCloseModal();
          }
        }}
      >
        {selectedVariantIndex !== null && (
          <VariantMediaView
            variantIndex={selectedVariantIndex}
            variantTitle={selectedVariantTitle}
            onClose={handleCloseModal}
            onSubmit={handleCloseModal}
            onSaveMedia={handleSaveMedia}
            initialMedia={selectedVariantMedia}
            productMedia={productMedia}
          />
        )}
      </StackedFocusModal>
    </>
  );
};
