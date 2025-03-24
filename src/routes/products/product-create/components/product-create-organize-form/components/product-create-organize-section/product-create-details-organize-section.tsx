import { Button, Heading } from '@medusajs/ui';
import {
  UseFormReturn,
  useFieldArray,
} from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

import { ChipGroup } from '../../../../../../../components/common/chip-group';
import { Form } from '../../../../../../../components/common/form';
import { SwitchBox } from '../../../../../../../components/common/switch-box';
import { Combobox } from '../../../../../../../components/inputs/combobox';
import { StackedFocusModal } from '../../../../../../../components/modals';
import { useComboboxData } from '../../../../../../../hooks/use-combobox-data';
import {
  fetchQuery,
  sdk,
} from '../../../../../../../lib/client';
import { CategoryCombobox } from '../../../../../common/components/category-combobox';
import { ProductCreateSchemaType } from '../../../../types';

type ProductCreateOrganizationSectionProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
};

export const ProductCreateOrganizationSection = ({
  form,
}: ProductCreateOrganizationSectionProps) => {
  const { t } = useTranslation();

  const collections = useComboboxData({
    queryKey: ['product_collections'],
    queryFn: (params) => sdk.store.collection.list(params),
    getOptions: (data) =>
      data.collections.map((collection) => ({
        label: collection.title!,
        value: collection.id!,
      })),
  });

  const types = useComboboxData({
    queryKey: ['product_types'],
    queryFn: (params) => sdk.store.productType.list(params),
    getOptions: (data) =>
      data.product_types.map((type: any) => ({
        label: type.value,
        value: type.id,
      })),
  });

  const tags = useComboboxData({
    queryKey: ['product_tags'],
    queryFn: (params) => sdk.store.productTag.list(params),
    getOptions: (data) =>
      data.product_tags.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })),
  });

  const shippingProfiles = useComboboxData({
    queryKey: ['shipping_profiles'],
    queryFn: (params) =>
      sdk.store.shippingProfile.list(params),
    getOptions: (data) =>
      data.shipping_profiles.map(
        (shippingProfile: any) => ({
          label: shippingProfile.name,
          value: shippingProfile.id,
        })
      ),
  });

  return (
    <div id='organize' className='flex flex-col gap-y-8'>
      <Heading>{t('products.organization.header')}</Heading>
      <SwitchBox
        control={form.control}
        name='discountable'
        label={t('products.fields.discountable.label')}
        description={t('products.fields.discountable.hint')}
        optional
      />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Form.Field
          control={form.control}
          name='type_id'
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t('products.fields.type.label')}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={types.options}
                    searchValue={types.searchValue}
                    onSearchValueChange={
                      types.onSearchValueChange
                    }
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
          name='collection_id'
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t('products.fields.collection.label')}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={collections.options}
                    searchValue={collections.searchValue}
                    onSearchValueChange={
                      collections.onSearchValueChange
                    }
                    fetchNextPage={
                      collections.fetchNextPage
                    }
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <Form.Field
          control={form.control}
          name='categories'
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t('products.fields.categories.label')}
                </Form.Label>
                <Form.Control>
                  <CategoryCombobox {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
        <Form.Field
          control={form.control}
          name='tags'
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t('products.fields.tags.label')}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={tags.options}
                    searchValue={tags.searchValue}
                    onSearchValueChange={
                      tags.onSearchValueChange
                    }
                    fetchNextPage={tags.fetchNextPage}
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div>
          <Form.Label optional>
            {t('products.fields.shipping_profile.label')}
          </Form.Label>
          <Form.Hint>
            <Trans
              i18nKey={
                'products.fields.shipping_profile.hint'
              }
            />
          </Form.Hint>
        </div>
        <Form.Field
          control={form.control}
          name='shipping_profile_id'
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={shippingProfiles.options}
                    searchValue={
                      shippingProfiles.searchValue
                    }
                    onSearchValueChange={
                      shippingProfiles.onSearchValueChange
                    }
                    fetchNextPage={
                      shippingProfiles.fetchNextPage
                    }
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            );
          }}
        />
      </div>
    </div>
  );
};
