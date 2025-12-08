import { forwardRef, useEffect, useImperativeHandle } from 'react';

import { Button, Divider, Heading, Text } from '@medusajs/ui';
import { Path, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useAttributes } from '../../../../../hooks/api/attributes';
import { ProductCreateSchemaType } from '../../types';
import { createAttributeValidationRules } from '../../utils/attribute-validation';
import { processAttributes, type FormField } from '../../utils/process-attributes';
import { RequiredAttributesList } from './required-attributes-list';

export interface ProductCreateAttributesFormRef {
  validateAttributes: () => Promise<boolean>;
  requiredFormFields: FormField[];
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

  // Process attributes: filter and map to form fields (only required attributes)
  const processedAttributes = processAttributes(allAttributes, primaryCategoryId);
  const requiredFormFields = processedAttributes.required.all;

  // Create validation rules for required attributes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validationRules = createAttributeValidationRules(requiredFormFields, t as any);

  // Custom validation function for dynamic attributes
  const validateAttributes = async () => {
    const errors: Record<string, string> = {};

    requiredFormFields.forEach(field => {
      if (field.is_required) {
        const value = form.getValues(field.handle as Path<ProductCreateSchemaType>);

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
    requiredFormFields.forEach(field => {
      if (field.is_required) {
        form.clearErrors(field.handle as Path<ProductCreateSchemaType>);
      }
    });

    // Set errors manually
    Object.keys(errors).forEach(fieldName => {
      form.setError(fieldName as Path<ProductCreateSchemaType>, {
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
      requiredFormFields
    }),
    [validateAttributes, requiredFormFields, form, t]
  );

  // Clear errors when field values change (but don't set new errors to avoid interference)
  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name && requiredFormFields.some(field => field.handle === name)) {
        const field = requiredFormFields.find(f => f.handle === name);
        if (field && field.is_required) {
          const value = values[name as keyof typeof values];
          let isValid = false;

          // Check if the field is valid (only clear errors, don't set new ones)
          switch (field.ui_component) {
            case 'select':
            case 'toggle':
              isValid = typeof value === 'string' && value !== '';
              break;
            case 'text':
            case 'text_area':
              isValid = typeof value === 'string' && value !== '';
              break;
            case 'multivalue':
              isValid = Array.isArray(value) && value.length > 0;
              break;
            case 'unit':
              isValid = value !== undefined && value !== null && value !== '';
              break;
            default:
              isValid = false;
              break;
          }

          // Only clear errors if field is valid, don't set new errors
          if (isValid) {
            form.clearErrors(name as Path<ProductCreateSchemaType>);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, requiredFormFields]);

  return (
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8">
        <Header />
        <div className="flex flex-col gap-y-8">
          {requiredFormFields.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {allAttributesLoading
                ? 'Loading attributes...'
                : 'No attributes available for this category'}
            </div>
          ) : (
            <>
              <Divider variant="dashed" />
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

              <RequiredAttributesList
                form={form}
                fields={requiredFormFields}
                validationRules={validationRules}
              />
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
