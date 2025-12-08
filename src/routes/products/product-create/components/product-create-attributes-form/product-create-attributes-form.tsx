import { forwardRef, Fragment, useEffect, useImperativeHandle } from 'react';

import { Button, Divider, Heading, Select, Text, Textarea } from '@medusajs/ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form } from '../../../../../components/common/form';
import { SwitchBox } from '../../../../../components/common/switch-box';
import { Combobox } from '../../../../../components/inputs/combobox';
import { MultiSelect } from '../../../../../components/inputs/multi-select';
import { NumericInput } from '../../../../../components/inputs/numeric-input';
import { useAttributes } from '../../../../../hooks/api/attributes';
import { ProductCreateSchemaType } from '../../types';
import { createAttributeValidationRules } from '../../utils/attribute-validation';

export interface ProductCreateAttributesFormRef {
  validateAttributes: () => Promise<boolean>;
  allFormFields: any[];
}

type ProductCreateAttributesFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
};

export const ProductCreateAttributesForm = forwardRef<
  ProductCreateAttributesFormRef,
  ProductCreateAttributesFormProps
>(({ form }, ref) => {
  const { t } = useTranslation();

  const primaryCategoryId = form.watch('categories')?.[0];

  const { attributes: allAttributes, isLoading: allAttributesLoading } = useAttributes({
    fields:
      'id,name,handle,description,ui_component,is_required,product_categories.*,possible_values.*'
  });

  const globalAttributes =
    allAttributes?.filter(
      (attr: any) => !attr.product_categories || attr.product_categories.length === 0
    ) || [];

  const categorySpecificAttributes =
    allAttributes?.filter(
      (attr: any) => attr.product_categories && attr.product_categories.length > 0
    ) || [];

  const applicableCategoryAttributes = categorySpecificAttributes.filter((attr: any) =>
    attr.product_categories?.some((cat: any) => cat.id === primaryCategoryId)
  );

  // Priority: Category-specific attributes first, then global attributes
  const categorySpecificFormFields = applicableCategoryAttributes.map((attr: any) => ({
    key: attr.id,
    id: attr.id,
    name: attr.name,
    handle: attr.handle,
    ui_component: attr.ui_component,
    is_required: attr.is_required,
    description: attr.description,
    possible_values:
      attr.possible_values?.map((value: any) => ({
        value: value.id,
        label: value.value
      })) || []
  }));

  const globalFormFields = globalAttributes.map((attr: any) => ({
    key: attr.id,
    id: attr.id,
    name: attr.name,
    handle: attr.handle,
    ui_component: attr.ui_component,
    is_required: attr.is_required,
    description: attr.description,
    possible_values:
      attr.possible_values?.map((value: any) => ({
        value: value.id,
        label: value.value
      })) || []
  }));

  // Combine all form fields (category-specific first, then global)
  const allFormFields = [...categorySpecificFormFields, ...globalFormFields];

  // Create validation rules for all attributes
  const validationRules = createAttributeValidationRules(allFormFields, t as any);

  // Custom validation function for dynamic attributes
  const validateAttributes = async () => {
    const errors: Record<string, string> = {};

    allFormFields.forEach((field: any) => {
      if (field.is_required) {
        const value = form.getValues(field.handle as any);

        switch (field.ui_component) {
          case 'select':
            if (!value || value === '') {
              errors[field.handle] = t('products.fields.attributes.validation.requiredSelect');
            }
            break;
          case 'text':
          case 'text_area':
            if (!value || value === '') {
              errors[field.handle] = t('products.fields.attributes.validation.requiredEnter');
            }
            break;
          case 'multivalue':
            if (!value || !Array.isArray(value) || value.length === 0) {
              errors[field.handle] = t(
                'products.fields.attributes.validation.requiredSelectMultiple'
              );
            }
            break;
          case 'toggle':
            if (!value || value === '') {
              errors[field.handle] = t('products.fields.attributes.validation.requiredSelect');
            }
            break;
          case 'unit':
            if (value === undefined || value === null || value === '') {
              errors[field.handle] = t('products.fields.attributes.validation.requiredEnter');
            }
            break;
        }
      }
    });

    // Clear all existing errors first
    allFormFields.forEach((field: any) => {
      if (field.is_required) {
        form.clearErrors(field.handle as any);
      }
    });

    // Set errors manually
    Object.keys(errors).forEach(fieldName => {
      form.setError(fieldName as any, {
        type: 'required',
        message: errors[fieldName]
      });
    });

    return Object.keys(errors).length === 0;
  };

  // Expose validation function and form fields to parent
  useImperativeHandle(
    ref,
    () => ({
      validateAttributes,
      allFormFields
    }),
    [validateAttributes, allFormFields, form, t]
  );

  // Clear errors when field values change (but don't set new errors to avoid interference)
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name && allFormFields.some((field: any) => field.handle === name)) {
        const field = allFormFields.find((f: any) => f.handle === name);
        if (field && field.is_required) {
          const value = (values as any)[name];
          let isValid = false;

          // Check if the field is valid (only clear errors, don't set new ones)
          switch (field.ui_component) {
            case 'select':
            case 'toggle':
              isValid = value && value !== '';
              break;
            case 'text':
            case 'text_area':
              isValid = value && value !== '';
              break;
            case 'multivalue':
              isValid = value && Array.isArray(value) && value.length > 0;
              break;
            case 'unit':
              isValid = value !== undefined && value !== null && value !== '';
              break;
          }

          // Only clear errors if field is valid, don't set new errors
          if (isValid) {
            form.clearErrors(name as any);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, allFormFields]);

  return (
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8">
        <Header />
        <div className="flex flex-col gap-y-8">
          {allFormFields.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {allAttributesLoading
                ? 'Loading attributes...'
                : 'No attributes available for this category'}
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-y-2">
                <Heading
                  level="h3"
                  className="text-ui-fg-base"
                >
                  {t('products.create.attributes.requiredHeading')}
                </Heading>
                <Text
                  size="small"
                  className="text-ui-fg-subtle"
                >
                  {t('products.create.attributes.requiredDescription')}
                </Text>
              </div>
              <Divider variant="dashed" />
              {allFormFields.map((field: any, index: number) => (
                <Fragment key={field.id}>
                  <div className="flex flex-col gap-y-4">
                    {field.ui_component === 'select' && (
                      <Form.Field
                        control={form.control}
                        name={field.handle as any}
                        rules={validationRules[field.handle] || {}}
                        render={({ field: formField, fieldState }) => (
                          <Form.Item>
                            <Form.Label
                              optional={!field.is_required}
                              tooltip={
                                field.is_required && t('products.fields.attributes.requiredTooltip')
                              }
                            >
                              {field.name}
                            </Form.Label>
                            <Form.Control>
                              <Combobox
                                {...formField}
                                options={field.possible_values}
                                aria-invalid={!!fieldState.error}
                                // placeholder={`Select ${field.name.toLowerCase()}`}
                              />
                            </Form.Control>
                            <Form.ErrorMessage />
                          </Form.Item>
                        )}
                      />
                    )}

                    {field.ui_component === 'multivalue' && (
                      <>
                        <Form.Field
                          control={form.control}
                          name={field.handle as any}
                          rules={validationRules[field.handle] || {}}
                          render={({ field: formField, fieldState }) => (
                            <Form.Item>
                              <Form.Label
                                optional={!field.is_required}
                                tooltip={
                                  field.is_required &&
                                  t('products.fields.attributes.requiredTooltip')
                                }
                              >
                                {field.name}
                              </Form.Label>
                              <Form.Control>
                                <MultiSelect
                                  value={formField.value}
                                  onChange={formField.onChange}
                                  name={formField.name}
                                  options={field.possible_values}
                                  showSearch={true}
                                  aria-invalid={!!fieldState.error}
                                />
                              </Form.Control>
                              <Form.ErrorMessage />
                            </Form.Item>
                          )}
                        />
                        <SwitchBox
                          control={form.control as any}
                          name={`${field.handle}UseForVariants` as any}
                          label={t('products.fields.attributes.useForVariants.label')}
                          description={t('products.fields.attributes.useForVariants.description')}
                        />
                      </>
                    )}

                    {field.ui_component === 'text_area' && (
                      <Form.Field
                        control={form.control}
                        name={field.handle as any}
                        rules={validationRules[field.handle] || {}}
                        render={({ field: formField, fieldState }) => (
                          <Form.Item>
                            <Form.Label
                              optional={!field.is_required}
                              tooltip={
                                field.is_required && t('products.fields.attributes.requiredTooltip')
                              }
                            >
                              {field.name}
                            </Form.Label>
                            <Form.Control>
                              <Textarea
                                {...formField}
                                placeholder={t('products.fields.attributes.enterValuePlaceholder')}
                                aria-invalid={!!fieldState.error}
                              />
                            </Form.Control>
                            <Form.ErrorMessage />
                          </Form.Item>
                        )}
                      />
                    )}

                    {field.ui_component === 'toggle' && (
                      <Form.Field
                        control={form.control}
                        name={field.handle as any}
                        rules={validationRules[field.handle] || {}}
                        render={({ field: formField, fieldState }) => (
                          <Form.Item>
                            <Form.Label
                              optional={!field.is_required}
                              tooltip={
                                field.is_required && t('products.fields.attributes.requiredTooltip')
                              }
                            >
                              {field.name}
                            </Form.Label>
                            <Form.Control>
                              <Select
                                {...formField}
                                onValueChange={formField.onChange}
                                value={formField.value}
                              >
                                <Select.Trigger aria-invalid={!!fieldState.error}>
                                  <Select.Value
                                    placeholder={t(
                                      'products.fields.attributes.selectValuePlaceholder'
                                    )}
                                  />
                                </Select.Trigger>
                                <Select.Content>
                                  <Select.Item value="true">{t('general.true')}</Select.Item>
                                  <Select.Item value="false">{t('general.false')}</Select.Item>
                                </Select.Content>
                              </Select>
                            </Form.Control>
                            <Form.ErrorMessage />
                          </Form.Item>
                        )}
                      />
                    )}

                    {field.ui_component === 'unit' && (
                      <Form.Field
                        control={form.control}
                        name={field.handle as any}
                        rules={validationRules[field.handle] || {}}
                        render={({ field: formField, fieldState }) => (
                          <Form.Item>
                            <Form.Label
                              optional={!field.is_required}
                              tooltip={
                                field.is_required && t('products.fields.attributes.requiredTooltip')
                              }
                            >
                              {field.name}
                            </Form.Label>
                            <Form.Control>
                              <NumericInput
                                value={formField.value}
                                onChange={formField.onChange}
                                onBlur={() => {
                                  formField.onBlur();
                                  // Blur the input when validation errors appear to prevent aria-hidden warning
                                  if (fieldState.error) {
                                    // Use setTimeout to blur after the current event loop
                                    setTimeout(() => {
                                      const input = document.querySelector(
                                        `input[name="${formField.name}"]`
                                      ) as HTMLInputElement;
                                      if (input) {
                                        input.blur();
                                      }
                                    }, 0);
                                  }
                                }}
                                name={formField.name}
                                placeholder={t('products.fields.attributes.enterValuePlaceholder')}
                                aria-invalid={!!fieldState.error}
                              />
                            </Form.Control>
                            <Form.ErrorMessage />
                          </Form.Item>
                        )}
                      />
                    )}
                    {field.description && (
                      <p className="txt-compact-small text-ui-fg-subtle">{field.description}</p>
                    )}
                  </div>
                  {index < allFormFields.length - 1 && <Divider variant="dashed" />}
                </Fragment>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCreateAttributesForm.displayName = 'ProductCreateAttributesForm';

const Header = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-y-2">
          <Heading
            level="h1"
            className="text-ui-fg-base"
          >
            {t('products.create.tabs.attributes')}
          </Heading>
          <Text
            size="small"
            className="max-w-[440px] text-ui-fg-subtle"
          >
            {t('products.create.attributes.description')}
          </Text>
        </div>
        <Button
          size="small"
          variant="secondary"
          type="button"
          className="min-w-[100px]"
        >
          {t('actions.add')} {t('products.create.attributes.buttonLabel')}
        </Button>
      </div>
    </div>
  );
};
