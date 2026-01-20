import { XMarkMini } from '@medusajs/icons';
import { IconButton, Input, Label } from '@medusajs/ui';
import { Controller, UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { SwitchBox } from '../../../../../components/common/switch-box';
import { ChipInput } from '../../../../../components/inputs/chip-input';
import { ProductCreateSchemaType } from '../../types';

type UserCreatedOptionsListProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  options: {
    fields: Array<{ id: string }>;
    append: (option: { title: string; values: string[]; metadata?: Record<string, unknown> }) => void;
    remove: (index: number) => void;
  };
  /**
   * Whether the user can remove an option row (shows the X button).
   * Defaults to true to preserve behavior in product create flows.
   */
  allowRemove?: boolean;
};

export const UserCreatedOptionsList = ({
  form,
  options,
  allowRemove = true,
}: UserCreatedOptionsListProps) => {
  const { t } = useTranslation();

  // Watch all options to filter user-created ones
  const watchedOptions = useWatch({
    control: form.control,
    name: 'options',
    defaultValue: []
  });

  // Filter only user-created options (with metadata.author === 'vendor')
  const userCreatedOptions = options.fields
    .map((field, index) => ({ field, index }))
    .filter(({ index }) => {
      const option = watchedOptions[index];
      return option?.metadata?.author === 'vendor';
    });

  if (userCreatedOptions.length === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-y-4">
      {userCreatedOptions.map(({ field, index }) => {
        return (
          <li key={field.id} className="flex flex-col gap-y-4">
            <div className="bg-ui-bg-component shadow-elevation-card-rest grid grid-cols-[1fr_28px] items-center gap-1.5 rounded-xl p-1.5">
              <div className="grid grid-cols-[min-content,1fr] items-center gap-1.5">
                <div className="flex items-center px-2 py-1.5">
                  <Label
                    size="xsmall"
                    weight="plus"
                    className="text-ui-fg-subtle"
                    htmlFor={`options.${index}.title`}
                  >
                    {t('fields.title')}
                  </Label>
                </div>
                <Input
                  className="bg-ui-bg-field-component hover:bg-ui-bg-field-component-hover"
                  {...form.register(`options.${index}.title` as any)}
                  placeholder={t('products.fields.options.optionTitlePlaceholder')}
                />
                <div className="flex items-center px-2 py-1.5">
                  <Label
                    size="xsmall"
                    weight="plus"
                    className="text-ui-fg-subtle"
                    htmlFor={`options.${index}.values`}
                  >
                    {t('fields.values')}
                  </Label>
                </div>
                <Controller
                  control={form.control}
                  name={`options.${index}.values` as any}
                  render={({ field: { onChange, ...field } }) => {
                    return (
                      <ChipInput
                        {...field}
                        variant="contrast"
                        onChange={onChange}
                        placeholder={t('products.fields.options.variantionsPlaceholder')}
                      />
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
              description={t('products.fields.attributes.useForVariants.description')}
            />
          </li>
        );
      })}
    </ul>
  );
};

