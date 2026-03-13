import { zodResolver } from '@hookform/resolvers/zod';
import { HttpTypes } from '@medusajs/types';
import { Button, InlineTip, Input } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Form } from '../../../../../components/common/form';
import { SwitchBox } from '../../../../../components/common/switch-box';
import { ChipInput } from '../../../../../components/inputs/chip-input';
import { RouteDrawer, useRouteModal } from '../../../../../components/modals';
import { i18n } from '../../../../../components/utilities/i18n';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { useUpdateProductOption } from '../../../../../hooks/api/products';

type EditProductOptionFormProps = {
  option: HttpTypes.AdminProductOption;
};

const EditProductOptionSchema = z.object({
  title: z.string().min(1, i18n.t('products.edit.attributes.titleRequired')),
  values: z.array(z.string()).min(1, i18n.t('products.edit.attributes.valuesRequired')),
  use_for_variations: z.boolean()
});

export const CreateProductOptionForm = ({ option }: EditProductOptionFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const form = useForm<z.infer<typeof EditProductOptionSchema>>({
    defaultValues: {
      title: option.title,
      values: option?.values?.map(v => v.value),
      use_for_variations: true
    },
    resolver: zodResolver(EditProductOptionSchema)
  });

  const useForVariations = form.watch('use_for_variations');

  const { mutateAsync, isPending } = useUpdateProductOption(option.product_id!, option.id);

  const handleSubmit = form.handleSubmit(async data => {
    const { use_for_variations, ...rest } = data;

    if (!use_for_variations) {
      await mutateAsync({ convert_to_attribute: true } as any, {
        onSuccess: () => {
          handleSuccess();
        }
      });
    } else {
      await mutateAsync(rest as any, {
        onSuccess: () => {
          handleSuccess();
        }
      });
    }
  });

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-1 flex-col gap-y-4 overflow-auto">
          <div className="flex flex-col gap-y-2 rounded-xl border bg-ui-bg-component p-1.5">
            <div className="flex flex-col gap-y-2">
              <Form.Field
                control={form.control}
                name="title"
                render={({ field }) => {
                  return (
                    <Form.Item className="flex flex-row items-start gap-x-1.5 space-y-0 [&>div:last-child]:w-full">
                      <Form.Label className="min-w-[60px] px-2 py-1.5">
                        {t('products.fields.options.optionTitle')}
                      </Form.Label>
                      <Form.Control>
                        <div className="flex w-full flex-col gap-y-1.5">
                          <Input
                            {...field}
                            disabled={!useForVariations}
                            placeholder={t('products.fields.options.optionTitlePlaceholder')}
                            className="w-full bg-ui-bg-base"
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
                name="values"
                render={({ field: { ...field } }) => {
                  return (
                    <Form.Item className="flex flex-row items-start gap-x-1.5 space-y-0">
                      <Form.Label className="min-w-[60px] px-2 py-1.5">
                        {t('products.fields.options.variations')}
                      </Form.Label>
                      <Form.Control>
                        <div className="flex w-full flex-col gap-y-1.5">
                          <ChipInput
                            {...field}
                            disabled={!useForVariations}
                            placeholder={t('products.fields.options.variantionsPlaceholder')}
                            className="w-full bg-ui-bg-base"
                          />
                          <Form.ErrorMessage />
                        </div>
                      </Form.Control>
                    </Form.Item>
                  );
                }}
              />
            </div>
            <SwitchBox
              control={form.control}
              name="use_for_variations"
              label={t('products.edit.attributes.useForVariations')}
              description={t('products.edit.attributes.useForVariationsDescription')}
              className="pl-14 [&>*]:shadow-none"
            />
          </div>

          {!useForVariations && (
            <InlineTip
              variant="warning"
              label={t('general.warning')}
            >
              {t('products.edit.attributes.conversionWarning')}
            </InlineTip>
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
