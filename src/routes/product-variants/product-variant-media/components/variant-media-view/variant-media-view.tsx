import { HttpTypes } from '@medusajs/types';
import { useSearchParams } from 'react-router-dom';

import { EditVariantMediaForm } from '../edit-variant-media-form';
import { VariantMediaGallery } from '../variant-media-gallery';
import { VariantMediaViewContext } from './variant-media-view-context';

type VariantMediaViewProps = {
  productId: string;
  variantId: string;
  variantImages: HttpTypes.AdminProductImage[];
  productImages: HttpTypes.AdminProductImage[];
  thumbnail: string | null;
};

enum View {
  GALLERY = 'gallery',
  EDIT = 'edit'
}

const getView = (searchParams: URLSearchParams): View => {
  const view = searchParams.get('view');
  if (view === View.EDIT) {
    return View.EDIT;
  }
  return View.GALLERY;
};

export const VariantMediaView = ({
  productId,
  variantId,
  variantImages,
  productImages,
  thumbnail
}: VariantMediaViewProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = getView(searchParams);

  const handleGoToView = (targetView: View) => () => {
    setSearchParams({ view: targetView });
  };

  return (
    <VariantMediaViewContext.Provider
      value={{
        goToGallery: handleGoToView(View.GALLERY),
        goToEdit: handleGoToView(View.EDIT)
      }}
    >
      {view === View.EDIT ? (
        <EditVariantMediaForm
          productId={productId}
          variantId={variantId}
          variantImages={variantImages}
          productImages={productImages}
          thumbnail={thumbnail}
        />
      ) : (
        <VariantMediaGallery
          productId={productId}
          variantId={variantId}
          images={variantImages}
          thumbnail={thumbnail}
        />
      )}
    </VariantMediaViewContext.Provider>
  );
};
