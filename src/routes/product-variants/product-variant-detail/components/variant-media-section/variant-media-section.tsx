import { useState } from 'react';

import { PencilSquare, ThumbnailBadge } from '@medusajs/icons';
import { HttpTypes } from '@medusajs/types';
import {
  Button,
  Checkbox,
  clx,
  CommandBar,
  Container,
  Heading,
  Text,
  Tooltip,
  usePrompt
} from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ActionMenu } from '../../../../../components/common/action-menu';
import { useUpdateProduct, useUpdateProductVariant } from '../../../../../hooks/api/products';
import { ExtendedAdminProductVariant } from '../../../../../types/products';

type VariantMediaSectionProps = {
  variant: ExtendedAdminProductVariant;
  productId: string;
  productImages: HttpTypes.AdminProductImage[];
};

type Media = {
  id: string;
  url: string;
  isThumbnail: boolean;
};

const getMedia = (
  images: HttpTypes.AdminProductImage[] | null | undefined,
  thumbnail: string | null | undefined
): Media[] => {
  const media: Media[] = (images ?? []).map(image => ({
    id: image.id!,
    url: image.url!,
    isThumbnail: image.url === thumbnail
  }));

  if (thumbnail && !media.some(m => m.isThumbnail)) {
    media.unshift({ id: 'variant_thumbnail', url: thumbnail, isThumbnail: true });
  }

  return media;
};

export const VariantMediaSection = ({
  variant,
  productId,
  productImages
}: VariantMediaSectionProps) => {
  const { t } = useTranslation();
  const prompt = usePrompt();
  const [selection, setSelection] = useState<Record<string, boolean>>({});

  const media = getMedia(variant.images, variant.thumbnail);

  const handleCheckedChange = (id: string) => {
    setSelection(prev => {
      if (prev[id]) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: true };
    });
  };

  const { mutateAsync: updateProduct } = useUpdateProduct(productId);
  const { mutateAsync: updateVariant } = useUpdateProductVariant(productId, variant.id);

  const handleDelete = async () => {
    const ids = Object.keys(selection);
    const includingThumbnail = ids.some(id => media.find(m => m.id === id)?.isThumbnail);

    const res = await prompt({
      title: t('general.areYouSure'),
      description: includingThumbnail
        ? t('products.media.deleteWarningWithThumbnail', { count: ids.length })
        : t('products.media.deleteWarning', { count: ids.length }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel')
    });

    if (!res) {
      return;
    }

    const ops: Promise<unknown>[] = [];

    const imageIdsToRemove = ids.filter(id => id !== 'variant_thumbnail');
    if (imageIdsToRemove.length) {
      const updatedProductImages = productImages
        .filter(img => !imageIdsToRemove.includes(img.id!))
        .map(img => ({ url: img.url! }));
      ops.push(updateProduct({ images: updatedProductImages }));
    }

    if (includingThumbnail) {
      ops.push(updateVariant({ thumbnail: null }));
    }

    await Promise.all(ops);
    setSelection({});
  };

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t('products.media.label')}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t('actions.edit'),
                  to: 'media?view=edit',
                  icon: <PencilSquare />
                }
              ]
            }
          ]}
        />
      </div>
      {media.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 px-6 py-4">
          {media.map((item, index) => {
            const isSelected = selection[item.id];

            return (
              <div
                className="group relative aspect-square size-full cursor-pointer overflow-hidden rounded-[8px] shadow-elevation-card-rest transition-fg hover:shadow-elevation-card-hover"
                key={item.id}
              >
                <div
                  className={clx(
                    'invisible absolute right-2 top-2 opacity-0 transition-fg group-hover:visible group-hover:opacity-100',
                    { 'visible opacity-100': isSelected }
                  )}
                >
                  <Checkbox
                    checked={selection[item.id] || false}
                    onCheckedChange={() => handleCheckedChange(item.id)}
                    aria-label={t('actions.select')}
                    data-testid={`variant-media-checkbox-${item.id}`}
                  />
                </div>
                {item.isThumbnail && (
                  <div className="absolute left-2 top-2">
                    <Tooltip content={t('fields.thumbnail')}>
                      <ThumbnailBadge />
                    </Tooltip>
                  </div>
                )}
                <Link
                  to="media"
                  state={{ curr: index }}
                >
                  <img
                    src={item.url}
                    alt={`${variant.title ?? ''} image ${index + 1}`}
                    className="size-full object-cover"
                  />
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-4 pb-8 pt-6">
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
              to="media?view=edit"
              data-testid="variant-media-add-button"
            >
              {t('products.media.emptyState.action')}
            </Link>
          </Button>
        </div>
      )}
      <CommandBar open={!!Object.keys(selection).length}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {t('general.countSelected', { count: Object.keys(selection).length })}
          </CommandBar.Value>
          <CommandBar.Seperator />
          <CommandBar.Command
            action={handleDelete}
            label={t('actions.delete')}
            shortcut="d"
          />
        </CommandBar.Bar>
      </CommandBar>
    </Container>
  );
};
