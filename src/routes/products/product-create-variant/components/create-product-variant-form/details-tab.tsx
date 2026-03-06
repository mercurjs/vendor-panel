import { Heading, Input, Switch } from '@medusajs/ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form } from '../../../../../components/common/form';
import { Combobox } from '../../../../../components/inputs/combobox';
import { ExtendedAdminProduct } from '../../../../../types/products';
import { CreateProductVariantSchema } from './constants';

type DetailsTabProps = {
  product: ExtendedAdminProduct;
  form: UseFormReturn<z.infer<typeof CreateProductVariantSchema>>;
};

function DetailsTab({ form, product }: DetailsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto">
      <div className="flex w-full max-w-[720px] flex-col gap-y-6 py-16 max-sm:px-8">
        <Heading level="h1">{t('products.variant.create.header')}</Heading>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>{t('fields.title')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              );
            }}
          />

          <Form.Field
            control={form.control}
            name="sku"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label optional>{t('fields.sku')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              );
            }}
          />

          {(product.options || []).map((option: any) => (
            <Form.Field
              key={option.id}
              control={form.control}
              name={`options.${option.title}`}
              render={({ field: { value, onChange, ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Label>{option.title}</Form.Label>
                    <Form.Control>
                      <Combobox
                        value={value}
                        onChange={v => {
                          onChange(v);
                        }}
                        {...field}
                        options={option.values.map((v: any) => ({
                          label: v.value,
                          value: v.value
                        }))}
                      />
                    </Form.Control>
                  </Form.Item>
                );
              }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-y-4">
          <Form.Field
            control={form.control}
            name="manage_inventory"
            render={({ field: { value, onChange, ...field } }) => {
              return (
                <Form.Item>
                  <div className="flex gap-x-3 rounded-lg bg-ui-bg-component p-4 shadow-elevation-card-rest">
                    <Form.Control>
                      <Switch
                        checked={value}
                        onCheckedChange={checked => onChange(!!checked)}
                        {...field}
                      />
                    </Form.Control>
                    <div className="flex flex-col">
                      <Form.Label>
                        {t('products.variant.inventory.manageInventoryLabel')}
                      </Form.Label>
                      <Form.Hint>{t('products.variant.inventory.manageInventoryHint')}</Form.Hint>
                    </div>
                  </div>
                  <Form.ErrorMessage />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="allow_backorder"
            render={({ field: { value, onChange, ...field } }) => {
              return (
                <Form.Item>
                  <div className="flex gap-x-3 rounded-lg bg-ui-bg-component p-4 shadow-elevation-card-rest">
                    <Form.Control>
                      <Switch
                        checked={value}
                        onCheckedChange={checked => onChange(!!checked)}
                        {...field}
                      />
                    </Form.Control>
                    <div className="flex flex-col">
                      <Form.Label>
                        {t('products.variant.inventory.allowBackordersLabel')}
                      </Form.Label>
                      <Form.Hint>{t('products.variant.inventory.allowBackordersHint')}</Form.Hint>
                    </div>
                  </div>
                  <Form.ErrorMessage />
                </Form.Item>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default DetailsTab;
