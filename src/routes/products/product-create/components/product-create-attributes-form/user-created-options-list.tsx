import { XMarkMini } from '@medusajs/icons';
import { IconButton } from '@medusajs/ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '../../../../../components/common/form';
import { SwitchBox } from '../../../../../components/common/switch-box';
import { ChipInput } from '../../../../../components/inputs/chip-input';
import { Combobox } from '../../../../../components/inputs/combobox';
import { ProductAttribute } from '../../../../../types/products';
import { ProductCreateSchemaType } from '../../types';

type UserCreatedOptionsListProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  options: {
    fields: Array<{ id: string }>;
    append: (option: {
      title: string;
      values: string[];
      metadata?: Record<string, unknown>;
      attributeId?: string;
    }) => void;
    remove: (index: number) => void;
  };
  allowRemove?: boolean;
  availableAttributes: ProductAttribute[];
  isExistingProduct?: boolean;
};

export const UserCreatedOptionsList = ({
  form,
  options,
  allowRemove = true,
  availableAttributes,
  isExistingProduct = false
}: UserCreatedOptionsListProps) => {
  const { t } = useTranslation();

  if (options?.fields?.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-y-4">
      {options.fields.map(({ id }, index) => {
        return (
          <li
            className="flex flex-col gap-y-2 rounded-xl border bg-ui-bg-component p-1.5"
            key={id}
          >
            <div className="flex items-center gap-1.5">
              <div className="flex grow flex-col gap-y-2">
                <Form.Field
                  control={form.control}
                  name={`options.${index}.title`}
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <Form.Item className="flex flex-row items-start gap-x-1.5 space-y-0 [&>div:last-child]:w-full">
                        <Form.Label className="min-w-[60px] px-2 py-1.5">
                          {t('products.fields.attributes.add.title.label')}
                        </Form.Label>
                        <Form.Control>
                          <div className="flex flex-col gap-y-1.5">
                            <Combobox
                              {...field}
                              placeholder={t('products.fields.attributes.add.title.placeholder')}
                              options={[
                                ...availableAttributes.map(attribute => ({
                                  label: attribute.name,
                                  value: attribute.id
                                }))
                              ]}
                              onChange={v => {
                                if (availableAttributes.find(attribute => attribute.id === v)) {
                                  form.setValue(`options.${index}.values`, []);
                                  form.setValue(`options.${index}.attributeId`, v);
                                  form.setValue(
                                    `options.${index}.title`,
                                    availableAttributes.find(attribute => attribute.id === v)
                                      ?.name || ''
                                  );
                                  form.setValue(`options.${index}.metadata`, { author: 'admin' });
                                  return;
                                }
                                form.setValue(`options.${index}.values`, []);
                                form.setValue(`options.${index}.attributeId`, '');
                                form.setValue(`options.${index}.metadata`, { author: 'vendor' });
                                onChange(v);
                              }}
                              onCreateOption={value => {
                                form.setValue(`options.${index}.title`, value);
                              }}
                              className="w-full bg-ui-bg-base hover:bg-ui-bg-base-hover [&>div>input]:px-0 [&>div>input]:placeholder:text-ui-fg-muted"
                              multiple={false}
                              showCheck={false}
                            />
                            <Form.ErrorMessage />
                          </div>
                        </Form.Control>
                      </Form.Item>
                    );
                  }}
                />
                <Form.Field
                  control={form.control}
                  name={`options.${index}.values`}
                  render={({ field: { ...field } }) => {
                    const selectedAttribute = availableAttributes?.find(
                      attribute => attribute.id === form.watch(`options.${index}.attributeId`)
                    );

                    return (
                      <Form.Item className="flex flex-row items-start gap-x-1.5 space-y-0">
                        <Form.Label className="min-w-[60px] px-2 py-1.5">
                          {t('products.fields.attributes.add.values.label')}
                        </Form.Label>
                        <Form.Control>
                          <div className="flex w-full flex-col gap-y-1.5">
                            {!!selectedAttribute ? (
                              <Combobox
                                {...field}
                                options={[
                                  ...selectedAttribute.possible_values.map(({ value }) => ({
                                    label: value,
                                    value: value
                                  }))
                                ]}
                                onCreateOption={value => {
                                  form.setValue(`options.${index}.values`, [...field.value, value]);
                                }}
                                className="w-full bg-ui-bg-base hover:bg-ui-bg-base-hover"
                              />
                            ) : (
                              <ChipInput
                                {...field}
                                variant="contrast"
                                placeholder={t('products.fields.attributes.add.values.placeholder')}
                                className="w-full"
                              />
                            )}
                            <Form.ErrorMessage />
                          </div>
                        </Form.Control>
                      </Form.Item>
                    );
                  }}
                />
              </div>
              {allowRemove && (
                <IconButton
                  type="button"
                  size="small"
                  variant="transparent"
                  className="text-ui-fg-muted"
                  onClick={() => options.remove(index)}
                >
                  <XMarkMini />
                </IconButton>
              )}
            </div>
            <SwitchBox
              control={form.control as any}
              name={`options.${index}.useForVariants` as any}
              label={t('products.fields.attributes.useForVariants.label')}
              description={
                isExistingProduct
                  ? t('products.fields.attributes.useForVariants.editDescription')
                  : t('products.fields.attributes.useForVariants.description')
              }
              className="pl-14 [&>*]:shadow-none"
            />
          </li>
        );
      })}
    </ul>
  );
};
