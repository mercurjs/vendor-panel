import { useCallback, useEffect, useState } from 'react';

import {
  ArrowDownTray,
  ThumbnailBadge,
  Trash,
  TriangleLeftMini,
  TriangleRightMini
} from '@medusajs/icons';
import { HttpTypes } from '@medusajs/types';
import { Button, clx, IconButton, Text, Tooltip, usePrompt } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { RouteFocusModal } from '../../../../../components/modals';
import { useUpdateProductVariant, useUpdateVariantMedia } from '../../../../../hooks/api/products';

type VariantMediaGalleryProps = {
  productId: string;
  variantId: string;
  images: HttpTypes.AdminProductImage[];
  thumbnail: string | null;
};

type Media = {
  id: string;
  url: string;
  isThumbnail: boolean;
};

const getMedia = (images: HttpTypes.AdminProductImage[], thumbnail: string | null): Media[] => {
  const media: Media[] = images.map(image => ({
    id: image.id!,
    url: image.url!,
    isThumbnail: image.url === thumbnail
  }));

  if (thumbnail && !media.some(m => m.isThumbnail)) {
    media.unshift({ id: 'variant_thumbnail', url: thumbnail, isThumbnail: true });
  }

  return media;
};

export const VariantMediaGallery = ({
  productId,
  variantId,
  images,
  thumbnail
}: VariantMediaGalleryProps) => {
  const { state } = useLocation();
  const [curr, setCurr] = useState<number>(state?.curr || 0);

  const { t } = useTranslation();
  const prompt = usePrompt();
  const { mutateAsync: updateVariantMedia, isPending: isMediaPending } = useUpdateVariantMedia(
    productId,
    variantId
  );
  const { mutateAsync: updateVariant, isPending: isVariantPending } = useUpdateProductVariant(
    productId,
    variantId
  );

  const isPending = isMediaPending || isVariantPending;
  const media = getMedia(images, thumbnail);

  const next = useCallback(() => {
    if (isPending) {
      return;
    }
    setCurr(prev => (prev + 1) % media.length);
  }, [media, isPending]);

  const prev = useCallback(() => {
    if (isPending) {
      return;
    }
    setCurr(prev => (prev - 1 + media.length) % media.length);
  }, [media, isPending]);

  const goTo = useCallback(
    (index: number) => {
      if (isPending) {
        return;
      }
      setCurr(index);
    },
    [isPending]
  );

  const handleDownloadCurrent = () => {
    if (isPending || !media.length) {
      return;
    }

    const a = document.createElement('a');
    a.href = media[curr].url;
    a.download = 'image';
    a.target = '_blank';
    a.click();
  };

  const handleDeleteCurrent = async () => {
    if (!media.length) {
      return;
    }

    const current = media[curr];

    const res = await prompt({
      title: t('general.areYouSure'),
      description: current.isThumbnail
        ? t('products.media.deleteWarningWithThumbnail', { count: 1 })
        : t('products.media.deleteWarning', { count: 1 }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel')
    });

    if (!res) {
      return;
    }

    if (curr === media.length - 1) {
      setCurr(prev => Math.max(0, prev - 1));
    }

    const ops: Promise<unknown>[] = [];

    if (current.id !== 'variant_thumbnail') {
      ops.push(updateVariantMedia({ remove: [current.id] }));
    }

    if (current.isThumbnail) {
      ops.push(updateVariant({ thumbnail: null }));
    }

    await Promise.all(ops);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [next, prev]);

  const noMedia = !media.length;

  return (
    <div className="flex size-full flex-col overflow-hidden">
      <RouteFocusModal.Header>
        <div className="flex items-center justify-end gap-x-2">
          <IconButton
            size="small"
            type="button"
            onClick={handleDeleteCurrent}
            disabled={noMedia}
            aria-label={t('products.media.deleteImageLabel')}
            data-testid="variant-media-gallery-delete"
          >
            <Trash />
            <span className="sr-only">{t('products.media.deleteImageLabel')}</span>
          </IconButton>
          <IconButton
            size="small"
            type="button"
            onClick={handleDownloadCurrent}
            disabled={noMedia}
            aria-label={t('products.media.downloadImageLabel')}
            data-testid="variant-media-gallery-download"
          >
            <ArrowDownTray />
            <span className="sr-only">{t('products.media.downloadImageLabel')}</span>
          </IconButton>
          <Button
            variant="secondary"
            size="small"
            asChild
          >
            <Link
              to={{ pathname: '.', search: 'view=edit' }}
              data-testid="variant-media-gallery-edit"
            >
              {t('actions.edit')}
            </Link>
          </Button>
        </div>
      </RouteFocusModal.Header>
      <RouteFocusModal.Body className="flex flex-col overflow-hidden">
        <Canvas
          curr={curr}
          media={media}
        />
        <Preview
          curr={curr}
          media={media}
          prev={prev}
          next={next}
          goTo={goTo}
        />
      </RouteFocusModal.Body>
    </div>
  );
};

const Canvas = ({ media, curr }: { media: Media[]; curr: number }) => {
  const { t } = useTranslation();

  if (media.length === 0) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-y-4 bg-ui-bg-subtle pb-8 pt-6">
        <div className="flex flex-col items-center">
          <Text
            size="small"
            leading="compact"
            weight="plus"
            className="text-ui-fg-subtle"
          >
            {t('products.media.emptyState.header')}
          </Text>
          <Text
            size="small"
            className="text-ui-fg-muted"
          >
            {t('products.media.emptyState.description')}
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          asChild
        >
          <Link
            to="?view=edit"
            data-testid="variant-media-gallery-add"
          >
            {t('products.media.emptyState.action')}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative size-full overflow-hidden bg-ui-bg-subtle">
      <div className="flex size-full items-center justify-center p-6">
        <div className="relative inline-block max-h-full max-w-full">
          {media[curr].isThumbnail && (
            <div className="absolute left-2 top-2">
              <Tooltip content={t('products.media.thumbnailTooltip')}>
                <ThumbnailBadge />
              </Tooltip>
            </div>
          )}
          <img
            src={media[curr].url}
            alt=""
            className="object-fit max-h-[calc(100vh-200px)] w-auto rounded-xl object-contain shadow-elevation-card-rest"
          />
        </div>
      </div>
    </div>
  );
};

const MAX_VISIBLE_ITEMS = 8;

const Preview = ({
  media,
  curr,
  prev,
  next,
  goTo
}: {
  media: Media[];
  curr: number;
  prev: () => void;
  next: () => void;
  goTo: (index: number) => void;
}) => {
  if (!media.length) {
    return null;
  }

  const getVisibleItems = (items: Media[], index: number) => {
    if (items.length <= MAX_VISIBLE_ITEMS) {
      return items;
    }

    const half = Math.floor(MAX_VISIBLE_ITEMS / 2);
    const start = (index - half + items.length) % items.length;
    const end = (start + MAX_VISIBLE_ITEMS) % items.length;

    if (end < start) {
      return [...items.slice(start), ...items.slice(0, end)];
    }

    return items.slice(start, end);
  };

  const visibleItems = getVisibleItems(media, curr);

  return (
    <div className="flex shrink-0 items-center justify-center gap-x-2 border-t p-3">
      <IconButton
        size="small"
        variant="transparent"
        className="text-ui-fg-muted"
        type="button"
        onClick={prev}
        aria-label="Previous image"
        data-testid="variant-media-gallery-prev"
      >
        <TriangleLeftMini />
      </IconButton>
      <div className="flex items-center gap-x-2">
        {visibleItems.map(item => {
          const isCurrentImage = item.id === media[curr].id;
          const originalIndex = media.findIndex(i => i.id === item.id);

          return (
            <button
              type="button"
              onClick={() => goTo(originalIndex)}
              className={clx('size-7 overflow-hidden rounded-[4px] outline-none transition-fg', {
                'shadow-borders-focus': isCurrentImage
              })}
              key={item.id}
              aria-label={`Go to image ${originalIndex + 1}`}
              data-testid={`variant-media-gallery-thumb-${item.id}`}
            >
              <img
                src={item.url}
                alt=""
                className="size-full object-cover"
              />
            </button>
          );
        })}
      </div>
      <IconButton
        size="small"
        variant="transparent"
        className="text-ui-fg-muted"
        type="button"
        onClick={next}
        aria-label="Next image"
        data-testid="variant-media-gallery-next"
      >
        <TriangleRightMini />
      </IconButton>
    </div>
  );
};
