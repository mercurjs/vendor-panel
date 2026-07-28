import { Fragment, useCallback, useMemo, useState } from 'react';

import { ThumbnailBadge } from '@medusajs/icons';
import type { HttpTypes } from '@medusajs/types';
import { Button, Checkbox, clx, CommandBar, toast, Tooltip } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { useUpdateProductVariant, useUpdateVariantMedia } from '../../../../../hooks/api/products';

type EditVariantMediaFormProps = {
  productId: string;
  variantId: string;
  variantImages: HttpTypes.AdminProductImage[];
  productImages: HttpTypes.AdminProductImage[];
  thumbnail: string | null;
};

export const EditVariantMediaForm = ({
  productId,
  variantId,
  variantImages,
  productImages,
  thumbnail
}: EditVariantMediaFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const originalImageIds = useMemo(
    () => new Set(variantImages.map(img => img.id!)),
    [variantImages]
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(variantImages.map(img => img.id!))
  );

  const [thumbnailId, setThumbnailId] = useState<string | null>(() => {
    if (!thumbnail) {
      return null;
    }
    const match = variantImages.find(img => img.url === thumbnail);

    return match?.id ?? null;
  });

  const { mutateAsync: updateVariantMedia, isPending: isMediaPending } = useUpdateVariantMedia(
    productId,
    variantId
  );
  const { mutateAsync: updateVariant, isPending: isVariantPending } = useUpdateProductVariant(
    productId,
    variantId
  );

  const isPending = isMediaPending || isVariantPending;

  const selectedImages = useMemo(
    () => productImages.filter(img => selectedIds.has(img.id!)),
    [productImages, selectedIds]
  );

  const unselectedImages = useMemo(
    () => productImages.filter(img => !selectedIds.has(img.id!)),
    [productImages, selectedIds]
  );

  const handleSelectImage = useCallback((imageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.add(imageId);

      return next;
    });
  }, []);

  const [checkedIds, setCheckedIds] = useState<Record<string, true>>({});

  const handleDeselectImage = useCallback(
    (imageId: string) => {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(imageId);

        return next;
      });

      if (thumbnailId === imageId) {
        setThumbnailId(null);
      }

      const { [imageId]: _, ...restChecked } = checkedIds;
      setCheckedIds(restChecked);
    },
    [thumbnailId, checkedIds]
  );

  const handleCheckedChange = useCallback(
    (imageId: string, value: boolean) => {
      if (!value) {
        const { [imageId]: _, ...rest } = checkedIds;
        setCheckedIds(rest);

        return;
      }
      setCheckedIds(prev => ({ ...prev, [imageId]: true }));
    },
    [checkedIds]
  );

  const handlePromoteToThumbnail = useCallback(() => {
    const ids = Object.keys(checkedIds);
    if (ids.length !== 1) {
      return;
    }

    setThumbnailId(ids[0]);
    setCheckedIds({});
  }, [checkedIds]);

  const checkedCount = Object.keys(checkedIds).length;

  const getEffectiveThumbnailId = useCallback(() => {
    if (selectedIds.size === 0) {
      return null;
    }

    if (thumbnailId && selectedIds.has(thumbnailId)) {
      return thumbnailId;
    }

    return [...selectedIds][0];
  }, [selectedIds, thumbnailId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const addIds = [...selectedIds].filter(id => !originalImageIds.has(id));
    const removeIds = [...originalImageIds].filter(id => !selectedIds.has(id));

    const effectiveThumbnailId = getEffectiveThumbnailId();
    const effectiveThumbnailUrl = effectiveThumbnailId
      ? (productImages.find(img => img.id === effectiveThumbnailId)?.url ?? null)
      : null;
    const thumbnailChanged = effectiveThumbnailUrl !== thumbnail;

    const ops: Promise<unknown>[] = [];

    if (addIds.length || removeIds.length) {
      ops.push(
        updateVariantMedia({
          ...(addIds.length ? { add: addIds } : {}),
          ...(removeIds.length ? { remove: removeIds } : {})
        })
      );
    }

    if (thumbnailChanged) {
      ops.push(updateVariant({ thumbnail: effectiveThumbnailUrl }));
    }

    if (!ops.length) {
      handleSuccess();

      return;
    }

    await Promise.all(ops)
      .then(() => {
        toast.success(t('products.media.successToast'));
        handleSuccess();
      })
      .catch(error => {
        toast.error(error.message);
      });
  };

  return (
    <KeyboundForm
      className="flex size-full flex-col overflow-hidden"
      onSubmit={handleSubmit}
    >
      <RouteFocusModal.Header>
        <div className="flex items-center justify-end gap-x-2">
          <Button
            variant="secondary"
            size="small"
            asChild
          >
            <Link to={{ pathname: '.', search: undefined }}>
              {t('products.media.galleryLabel')}
            </Link>
          </Button>
        </div>
      </RouteFocusModal.Header>
      <RouteFocusModal.Body className="flex flex-col overflow-hidden">
        <div className="flex size-full">
          <div className="flex-1 overflow-auto bg-ui-bg-subtle p-6">
            <div className="flex flex-wrap content-start gap-6">
              {selectedImages.map(img => {
                const effectiveThumbId = getEffectiveThumbnailId();
                const isThumb = img.id === effectiveThumbId;

                return (
                  <SelectedImageCard
                    key={img.id}
                    image={img}
                    isThumbnail={isThumb}
                    checked={!!checkedIds[img.id!]}
                    onCheckedChange={val => handleCheckedChange(img.id!, val)}
                  />
                );
              })}
            </div>
          </div>
          <div className="w-px shrink-0 bg-ui-border-base" />
          <div className="flex w-[318px] shrink-0 flex-col">
            <div className="p-4">
              <p className="txt-compact-small-plus text-ui-fg-base">
                {t('products.media.selectImages')}
              </p>
              <p className="txt-small mt-1 text-ui-fg-subtle">
                {t('products.media.selectImagesHint')}
              </p>
            </div>
            <div className="h-px bg-ui-border-base" />
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-2 gap-4">
                {unselectedImages.map(img => (
                  <UnselectedImageCard
                    key={img.id}
                    image={img}
                    onSelect={() => handleSelectImage(img.id!)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </RouteFocusModal.Body>
      <CommandBar open={!!checkedCount}>
        <CommandBar.Bar>
          <CommandBar.Value>{t('general.countSelected', { count: checkedCount })}</CommandBar.Value>
          <CommandBar.Seperator />
          {checkedCount === 1 && (
            <Fragment>
              <CommandBar.Command
                action={handlePromoteToThumbnail}
                label={t('products.media.makeThumbnail')}
                shortcut="t"
              />
              <CommandBar.Seperator />
            </Fragment>
          )}
          <CommandBar.Command
            action={() => {
              Object.keys(checkedIds).forEach(id => handleDeselectImage(id));
              setCheckedIds({});
            }}
            label={t('actions.remove')}
            shortcut="r"
          />
        </CommandBar.Bar>
      </CommandBar>
      <RouteFocusModal.Footer>
        <div className="flex items-center justify-end gap-x-2">
          <RouteFocusModal.Close asChild>
            <Button
              variant="secondary"
              size="small"
              data-testid="variant-media-edit-cancel"
            >
              {t('actions.cancel')}
            </Button>
          </RouteFocusModal.Close>
          <Button
            size="small"
            type="submit"
            isLoading={isPending}
            data-testid="variant-media-edit-save"
          >
            {t('actions.save')}
          </Button>
        </div>
      </RouteFocusModal.Footer>
    </KeyboundForm>
  );
};

type SelectedImageCardProps = {
  image: HttpTypes.AdminProductImage;
  isThumbnail: boolean;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
};

const SelectedImageCard = ({
  image,
  isThumbnail,
  checked,
  onCheckedChange
}: SelectedImageCardProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={clx(
        'group relative size-[156px] shrink-0 overflow-hidden rounded-lg',
        'shadow-elevation-card-rest'
      )}
    >
      {isThumbnail && (
        <div className="absolute left-2 top-2 z-[1]">
          <Tooltip content={t('products.media.thumbnailTooltip')}>
            <ThumbnailBadge />
          </Tooltip>
        </div>
      )}
      <div
        className={clx(
          'absolute right-2 top-2 z-[1] opacity-0 transition-opacity',
          'group-hover:opacity-100',
          { 'opacity-100': checked }
        )}
      >
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          aria-label={t('actions.select')}
          data-testid={`variant-media-check-${image.id}`}
        />
      </div>
      <img
        src={image.url!}
        alt=""
        className="size-full object-cover object-center"
      />
    </div>
  );
};

type UnselectedImageCardProps = {
  image: HttpTypes.AdminProductImage;
  onSelect: () => void;
};

const UnselectedImageCard = ({ image, onSelect }: UnselectedImageCardProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clx(
        'aspect-square w-full overflow-hidden rounded-lg',
        'shadow-elevation-card-rest transition-shadow',
        'hover:shadow-elevation-card-hover',
        'outline-none focus-visible:shadow-borders-focus'
      )}
      aria-label={`Select image`}
      data-testid={`variant-media-select-${image.id}`}
    >
      <img
        src={image.url!}
        alt=""
        className="size-full object-cover object-center"
      />
    </button>
  );
};
