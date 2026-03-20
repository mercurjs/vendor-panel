import { zodResolver } from '@hookform/resolvers/zod';
import { CircleInfoSolid } from '@medusajs/icons';
import { Button, InlineTip, Input, Select, Text, Textarea, Tooltip } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form } from '../../../../components/common/form';
import { SwitchBox } from '../../../../components/common/switch-box';
import { ChipInput } from '../../../../components/inputs/chip-input';
import { Combobox } from '../../../../components/inputs/combobox';
import { NumericInput } from '../../../../components/inputs/numeric-input';
import { RouteDrawer, useRouteModal } from '../../../../components/modals';
import { i18n } from '../../../../components/utilities/i18n';
import { KeyboundForm } from '../../../../components/utilities/keybound-form';
import { useUpdateProductAttribute } from '../../../../hooks/api/products';
import { ProductAttribute, ProductInformationalAttribute } from '../../../../types/products';

type EditProductAttributeFormProps = {
  productId: string;
  attribute: ProductInformationalAttribute;
  attributeDefinition?: ProductAttribute;
};

const EditProductAttributeSchema = z.object({
  values: z.array(z.string()).min(1, i18n.t('products.edit.attributes.valuesRequired')),
  use_for_variations: z.boolean()
});

export const EditProductAttributeForm = ({
  productId,
  attribute,
  attributeDefinition
}: EditProductAttributeFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const currentValues = attribute.values?.map(v => v.value) ?? [];

  const form = useForm<z.infer<typeof EditProductAttributeSchema>>({
    defaultValues: {
      values: currentValues,
      use_for_variations: false
    },
    resolver: zodResolver(EditProductAttributeSchema)
  });

  const useForVariations = form.watch('use_for_variations');

  const { mutateAsync, isPending } = useUpdateProductAttribute(productId, attribute.attribute_id);

  const handleSubmit = form.handleSubmit(async data => {
    await mutateAsync(
      {
        values: data.values,
        use_for_variations: data.use_for_variations
      },
      {
        onSuccess: () => {
          handleSuccess();
        }
      }
    );
  });

  const uiComponent = attributeDefinition?.ui_component ?? attribute.ui_component;
  const possibleValueOptions =
    attributeDefinition?.possible_values?.map(pv => ({
      value: pv.value,
      label: pv.value
    })) ?? [];

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-1 flex-col gap-y-2 overflow-auto">
          <div className="flex flex-col gap-y-2">
            <Text
              size="small"
              weight="plus"
              className="flex items-center gap-x-2"
            >
              {attribute.name}
              {(attribute.description || attribute.is_required) && (
                <Tooltip content={attribute.description || t('products.edit.attributes.required')}>
                  <CircleInfoSolid className="text-ui-fg-muted" />
                </Tooltip>
              )}
            </Text>

            <Form.Field
              control={form.control}
              name="values"
              render={({ field }) => {
                const renderValuesInput = () => {
                  if (uiComponent === 'select') {
                    return (
                      <Combobox
                        value={field.value[0] ?? ''}
                        onChange={val => field.onChange(val ? [val as string] : [])}
                        options={possibleValueOptions}
                        multiple={false}
                        placeholder={t(
                          'products.edit.attributes.valuesPlaceholder',
                          'Select value'
                        )}
                      />
                    );
                  }

                  if (uiComponent === 'multivalue') {
                    return (
                      <Combobox
                        value={field.value}
                        onChange={val => field.onChange(val ?? [])}
                        options={possibleValueOptions}
                        placeholder={t(
                          'products.edit.attributes.valuesPlaceholder',
                          'Select values'
                        )}
                      />
                    );
                  }

                  if (uiComponent === 'text') {
                    return (
                      <Input
                        value={field.value[0] ?? ''}
                        onChange={e => field.onChange([e.target.value])}
                        placeholder={t('products.edit.attributes.valuesPlaceholder', 'Enter value')}
                        data-testid="edit-attribute-value-input"
                      />
                    );
                  }

                  if (uiComponent === 'text_area') {
                    return (
                      <Textarea
                        value={field.value[0] ?? ''}
                        onChange={e => field.onChange([e.target.value])}
                        placeholder={t('products.edit.attributes.valuesPlaceholder', 'Enter value')}
                        data-testid="edit-attribute-value-textarea"
                      />
                    );
                  }

                  if (uiComponent === 'toggle') {
                    return (
                      <Select
                        value={field.value[0] ?? ''}
                        onValueChange={val => field.onChange([val])}
                      >
                        <Select.Trigger data-testid="edit-attribute-value-toggle">
                          <Select.Value
                            placeholder={t('products.fields.attributes.selectValuePlaceholder')}
                          />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="true">{t('general.true')}</Select.Item>
                          <Select.Item value="false">{t('general.false')}</Select.Item>
                        </Select.Content>
                      </Select>
                    );
                  }

                  if (uiComponent === 'unit') {
                    return (
                      <NumericInput
                        value={
                          field.value[0] !== undefined ? parseFloat(field.value[0]) : undefined
                        }
                        onChange={val => field.onChange([String(val ?? '')])}
                        placeholder={t('products.edit.attributes.valuesPlaceholder', 'Enter value')}
                        data-testid="edit-attribute-value-numeric"
                        hideControls
                      />
                    );
                  }

                  return (
                    <ChipInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={t(
                        'products.edit.attributes.valuesPlaceholder',
                        'Type and press Enter'
                      )}
                    />
                  );
                };

                return (
                  <Form.Item>
                    <Form.Control>{renderValuesInput()}</Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />
          </div>

          {uiComponent === 'multivalue' && (
            <>
              <SwitchBox
                control={form.control}
                name="use_for_variations"
                label={t('products.edit.attributes.useForVariations')}
                description={t('products.edit.attributes.useForVariationsDescription')}
              />

              {useForVariations && (
                <InlineTip
                  variant="warning"
                  label={t('general.warning')}
                  className="mt-2"
                >
                  {t('products.edit.attributes.conversionWarning')}
                </InlineTip>
              )}
            </>
          )}
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button
                variant="secondary"
                size="small"
              >
                {t('actions.cancel')}
              </Button>
            </RouteDrawer.Close>
            <Button
              type="submit"
              size="small"
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
