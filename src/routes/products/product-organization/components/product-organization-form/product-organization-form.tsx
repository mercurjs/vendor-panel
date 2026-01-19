import { HttpTypes } from '@medusajs/types';
import { Button, toast } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form';
import { Combobox } from '../../../../../components/inputs/combobox';
import { RouteDrawer, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import {
  FormExtensionZone,
  useDashboardExtension,
  useExtendableForm
} from '../../../../../extensions';
import { useUpdateProduct } from '../../../../../hooks/api/products';
import { useComboboxData } from '../../../../../hooks/use-combobox-data';
import { fetchQuery } from '../../../../../lib/client';
import { ExtendedAdminProduct } from '../../../../../types/products';
import { CategoryCombobox } from '../../../common/components/category-combobox';

type ProductOrganizationFormProps = {
  product: ExtendedAdminProduct;
};

type ProductAdditionalData = {
  secondary_categories?: Array<{
    handle: string;
    secondary_categories_ids: string[];
  }>;
};

type ProductWithAdditionalData = ExtendedAdminProduct & {
  additional_data?: ProductAdditionalData;
  secondary_categories?: HttpTypes.AdminProductCategory[];
};

const getSecondaryCategoryIds = (product: ProductWithAdditionalData): string[] => {
  if (product.secondary_categories?.length) {
    return product.secondary_categories.map(cat => cat.id);
  }

  const additionalSecondaryCategories =
    product.additional_data?.secondary_categories?.flatMap(
      entry => entry.secondary_categories_ids ?? []
    ) ?? [];

  return Array.from(new Set(additionalSecondaryCategories));
};

const ProductOrganizationSchema = zod.object({
  type_id: zod.string().nullable(),
  collection_id: zod.string().nullable(),
  categories: zod.array(zod.string()),
  secondary_categories: zod.array(zod.string()).optional(),
  tag_ids: zod.array(zod.string())
});

export const ProductOrganizationForm = ({ product }: ProductOrganizationFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const { getFormConfigs, getFormFields } = useDashboardExtension();

  const configs = getFormConfigs('product', 'organize');
  const fields = getFormFields('product', 'organize');

  const collections = useComboboxData({
    queryKey: ['product_collections'],
    queryFn: params =>
      fetchQuery('/vendor/product-collections', {
        method: 'GET',
        query: params as Record<string, string | number>
      }),
    getOptions: data =>
      data.product_collections.map((collection: any) => ({
        label: collection.title!,
        value: collection.id!
      }))
  });

  const types = useComboboxData({
    queryKey: ['product_types'],
    queryFn: params =>
      fetchQuery('/vendor/product-types', {
        method: 'GET',
        query: params as { [key: string]: string | number }
      }),
    getOptions: data =>
      data.product_types.map((type: any) => ({
        label: type.value,
        value: type.id
      }))
  });

  const tags = useComboboxData({
    queryKey: ['product_tags'],
    queryFn: params =>
      fetchQuery('/vendor/product-tags', {
        method: 'GET',
        query: params as { [key: string]: string | number }
      }),
    getOptions: data =>
      data.product_tags.map((tag: any) => ({
        label: tag.value,
        value: tag.id
      }))
  });

  const form = useExtendableForm({
    defaultValues: {
      type_id: product.type_id ?? '',
      collection_id: product.collection_id ?? '',
      categories: product.categories?.map(cat => cat.id) || [],
      secondary_categories: getSecondaryCategoryIds(product as ProductWithAdditionalData),
      tag_ids: product.tags?.map(t => t.id) || []
    },
    schema: ProductOrganizationSchema,
    configs: configs,
    data: product
  });

  const { mutateAsync, isPending } = useUpdateProduct(product.id);

  const handleSubmit = form.handleSubmit(async data => {
    const additionalData: ProductAdditionalData = {};

    // Add secondary categories if any
    if (Array.isArray(data.secondary_categories)) {
      additionalData.secondary_categories = [
        {
          handle: product.handle || '',
          secondary_categories_ids: data.secondary_categories
        }
      ];
    }

    const payload = {
      type_id: data.type_id ? data.type_id : undefined,
      collection_id: data.collection_id ? data.collection_id : undefined,
      categories: data.categories?.map(id => ({ id })) || [],
      tags: data.tag_ids?.map(t => ({ id: t })) ?? [],
      ...(Object.keys(additionalData).length > 0 && {
        additional_data: additionalData
      })
    } as HttpTypes.AdminUpdateProduct & {
      additional_data?: ProductAdditionalData;
    };

    await mutateAsync(payload as Parameters<typeof mutateAsync>[0], {
      onSuccess: ({ product }) => {
        toast.success(
          t('products.organization.edit.toasts.success', {
            title: product.title
          })
        );
        handleSuccess();
      },
      onError: error => {
        toast.error(error.message);
      }
    });
  });

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex h-full flex-col"
      >
        <RouteDrawer.Body>
          <div className="flex h-full flex-col gap-y-4">
            <Form.Field
              control={form.control}
              name="tag_ids"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t('products.fields.tags.label')}</Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        multiple
                        options={tags.options}
                        onSearchValueChange={tags.onSearchValueChange}
                        searchValue={tags.searchValue}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />
            <Form.Field
              control={form.control}
              name="type_id"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t('products.fields.type.label')}</Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        options={types.options}
                        searchValue={types.searchValue}
                        onSearchValueChange={types.onSearchValueChange}
                        fetchNextPage={types.fetchNextPage}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />
            <Form.Field
              control={form.control}
              name="categories"
              render={({ field }) => {
                const currentValue = field.value || [];
                return (
                  <Form.Item>
                    <Form.Label>{t('products.fields.primaryCategory.label')}</Form.Label>
                    <Form.Control>
                      <CategoryCombobox
                        {...field}
                        value={currentValue}
                        onChange={newValue => {
                          // For primary category, only allow single selection
                          // If a new category was added (length increased), keep only the last one
                          // If a category was removed (length decreased), use the new array
                          if (newValue.length > currentValue.length) {
                            // New category selected - replace with just the new one
                            field.onChange([newValue[newValue.length - 1]]);
                          } else {
                            // Category deselected - use the filtered array (should be empty or same)
                            field.onChange(newValue);
                          }
                        }}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />
            <Form.Field
              control={form.control}
              name="secondary_categories"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t('products.fields.secondaryCategories.label')}
                    </Form.Label>
                    <Form.Control>
                      <CategoryCombobox
                        {...field}
                        value={field.value || []}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />
            <Form.Field
              control={form.control}
              name="collection_id"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>{t('products.fields.collection.label')}</Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        multiple={false}
                        options={collections.options}
                        onSearchValueChange={collections.onSearchValueChange}
                        searchValue={collections.searchValue}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />
            <FormExtensionZone
              fields={fields}
              form={form}
            />
          </div>
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button
                size="small"
                variant="secondary"
              >
                {t('actions.cancel')}
              </Button>
            </RouteDrawer.Close>
            <Button
              size="small"
              type="submit"
              isLoading={isPending}
            >
              {t('actions.save')}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};
