import { Fragment, useCallback, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ThumbnailBadge } from '@medusajs/icons';
import { HttpTypes } from '@medusajs/types';
import { Button, Checkbox, clx, CommandBar, toast, Tooltip } from '@medusajs/ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import {
  useUpdateProduct,
  useUpdateProductVariant,
  useUpdateVariantMedia
} from '../../../../../hooks/api/products';
import { uploadFilesQuery } from '../../../../../lib/client';
import { UploadMediaFormItem } from '../../../../products/common/components/upload-media-form-item';
import { EditProductMediaSchema, MediaSchema } from '../../../../products/product-create/constants';
import { EditProductMediaSchemaType } from '../../../../products/product-create/types';

type EditVariantMediaFormProps = {
  productId: string;
  variantId: string;
  variantImages: HttpTypes.AdminProductImage[];
  productImages: HttpTypes.AdminProductImage[];
  thumbnail: string | null;
};

type Media = z.infer<typeof MediaSchema>;

interface MediaView {
  id?: string;
  field_id: string;
  url: string;
  isThumbnail: boolean;
}

const getDefaultValues = (
  images: HttpTypes.AdminProductImage[],
  thumbnail: string | null
): Media[] => {
  const media: Media[] = images.map(image => ({
    id: image.id!,
    url: image.url!,
    isThumbnail: image.url === thumbnail,
    file: null
  }));

  if (thumbnail && !media.some(m => m.isThumbnail)) {
    media.unshift({
      id: Math.random().toString(36).substring(7),
      url: thumbnail,
      isThumbnail: true,
      file: null
    });
  }

  return media;
};

export const EditVariantMediaForm = ({
  productId,
  variantId,
  variantImages,
  productImages,
  thumbnail
}: EditVariantMediaFormProps) => {
  const [selection, setSelection] = useState<Record<string, true>>({});
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const originalImageIds = variantImages.map(img => img.id!);
  const originalThumbnail = thumbnail;

  const form = useForm<EditProductMediaSchemaType>({
    defaultValues: {
      media: getDefaultValues(variantImages, thumbnail)
    },
    resolver: zodResolver(EditProductMediaSchema)
  });

  const { fields, append, remove, update } = useFieldArray({
    name: 'media',
    control: form.control,
    keyName: 'field_id'
  });

  const { mutateAsync: updateVariantMedia, isPending: isMediaPending } = useUpdateVariantMedia(
    productId,
    variantId
  );
  const { mutateAsync: updateProduct, isPending: isProductPending } = useUpdateProduct(productId);
  const { mutateAsync: updateVariant, isPending: isVariantPending } = useUpdateProductVariant(
    productId,
    variantId
  );

  const isPending = isMediaPending || isProductPending || isVariantPending;

  const handleSubmit = form.handleSubmit(async ({ media }) => {
    const filesToUpload = media.map((m, i) => ({ file: m.file, index: i })).filter(m => !!m.file);

    let newImageIds: string[] = [];
    let newUrls: string[] = [];
    let withUpdatedUrls = media;

    if (filesToUpload.length) {
      const uploadResult = await uploadFilesQuery(filesToUpload).catch(() => {
        form.setError('media', {
          type: 'invalid_file',
          message: t('products.media.failedToUpload')
        });
        return { files: [] as HttpTypes.AdminFile[] };
      });

      const uploadedFiles: HttpTypes.AdminFile[] = uploadResult?.files ?? [];

      if (uploadedFiles.length) {
        withUpdatedUrls = media.map((entry, i) => {
          const toUploadIndex = filesToUpload.findIndex(m => m.index === i);
          if (toUploadIndex > -1) {
            return { ...entry, url: uploadedFiles[toUploadIndex]?.url };
          }
          return entry;
        });

        newUrls = uploadedFiles.map(f => f.url);
        const existingProductImageUrls = productImages.map(img => ({ url: img.url! }));

        const updatedProductResponse = await updateProduct({
          images: [...existingProductImageUrls, ...newUrls.map(url => ({ url }))]
        }).catch(() => null);

        if (updatedProductResponse) {
          const updatedImages: HttpTypes.AdminProductImage[] =
            (updatedProductResponse as any).product?.images ?? [];

          newImageIds = newUrls
            .map(url => updatedImages.find(img => img.url === url)?.id)
            .filter((id): id is string => !!id);
        }
      }
    }

    const currentItemIds = withUpdatedUrls.filter(m => !m.file && m.id).map(m => m.id!);

    const removeImageIds = originalImageIds.filter(id => !currentItemIds.includes(id));

    const newThumbnail = withUpdatedUrls.find(m => m.isThumbnail)?.url ?? null;
    const thumbnailChanged = newThumbnail !== originalThumbnail;

    const ops: Promise<unknown>[] = [];

    if (newImageIds.length) {
      ops.push(updateVariantMedia({ add: newImageIds }));
    }

    if (removeImageIds.length) {
      const updatedProductImages = [
        ...productImages
          .filter(img => !removeImageIds.includes(img.id!))
          .map(img => ({ url: img.url! })),
        ...newUrls.map(url => ({ url }))
      ];
      ops.push(updateProduct({ images: updatedProductImages }));
    }

    if (thumbnailChanged) {
      ops.push(updateVariant({ thumbnail: newThumbnail }));
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
  });

  const handleCheckedChange = useCallback(
    (fieldId: string) => (val: boolean) => {
      if (!val) {
        const { [fieldId]: _, ...rest } = selection;
        setSelection(rest);
        return;
      }
      setSelection(prev => ({ ...prev, [fieldId]: true }));
    },
    [selection]
  );

  const handleDelete = () => {
    const ids = Object.keys(selection);
    const indices = ids.map(fieldId => fields.findIndex(m => m.field_id === fieldId));
    remove(indices);
    setSelection({});
  };

  const handlePromoteToThumbnail = () => {
    const ids = Object.keys(selection);
    if (!ids.length) {
      return;
    }

    const currentThumbnailIndex = fields.findIndex(m => m.isThumbnail);
    if (currentThumbnailIndex > -1) {
      update(currentThumbnailIndex, { ...fields[currentThumbnailIndex], isThumbnail: false });
    }

    const index = fields.findIndex(m => m.field_id === ids[0]);
    update(index, { ...fields[index], isThumbnail: true });

    setSelection({});
  };

  const selectionCount = Object.keys(selection).length;

  return (
    <RouteFocusModal.Form
      blockSearchParams
      form={form}
    >
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
          <div className="flex size-full flex-col-reverse lg:grid lg:grid-cols-[1fr_560px]">
            <div className="size-full overflow-auto bg-ui-bg-subtle">
              <div className="grid h-fit auto-rows-auto grid-cols-4 gap-6 p-6">
                {fields.map(m => (
                  <MediaGridItem
                    key={m.field_id}
                    media={m}
                    checked={!!selection[m.field_id]}
                    onCheckedChange={handleCheckedChange(m.field_id)}
                  />
                ))}
              </div>
            </div>
            <div className="overflow-auto border-b bg-ui-bg-base px-6 py-4 lg:border-b-0 lg:border-l">
              <UploadMediaFormItem
                form={form}
                append={append}
              />
            </div>
          </div>
        </RouteFocusModal.Body>
        <CommandBar open={!!selectionCount}>
          <CommandBar.Bar>
            <CommandBar.Value>
              {t('general.countSelected', { count: selectionCount })}
            </CommandBar.Value>
            <CommandBar.Seperator />
            {selectionCount === 1 && (
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
              action={handleDelete}
              label={t('actions.delete')}
              shortcut="d"
            />
          </CommandBar.Bar>
        </CommandBar>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteFocusModal.Close asChild>
              <Button
                variant="secondary"
                size="small"
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
    </RouteFocusModal.Form>
  );
};

interface MediaGridItemProps {
  media: MediaView;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

const MediaGridItem = ({ media, checked, onCheckedChange }: MediaGridItemProps) => {
  const { t } = useTranslation();

  const handleToggle = useCallback(
    (value: boolean) => {
      onCheckedChange(value);
    },
    [onCheckedChange]
  );

  return (
    <div
      className={clx(
        'group relative aspect-square h-auto max-w-full overflow-hidden rounded-lg bg-ui-bg-subtle-hover shadow-elevation-card-rest outline-none hover:shadow-elevation-card-hover focus-visible:shadow-borders-focus'
      )}
    >
      {media.isThumbnail && (
        <div className="absolute left-2 top-2">
          <Tooltip content={t('products.media.thumbnailTooltip')}>
            <ThumbnailBadge />
          </Tooltip>
        </div>
      )}
      <div
        className={clx('absolute right-2 top-2 opacity-0 transition-fg', {
          'group-focus-within:opacity-100 group-hover:opacity-100 group-focus:opacity-100':
            !checked,
          'opacity-100': checked
        })}
      >
        <Checkbox
          onClick={e => {
            e.stopPropagation();
          }}
          checked={checked}
          onCheckedChange={handleToggle}
          aria-label="Select image"
          data-testid={`variant-media-item-checkbox-${media.field_id}`}
        />
      </div>
      <img
        src={media.url}
        alt=""
        className="size-full object-cover object-center"
      />
    </div>
  );
};
