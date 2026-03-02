import { CircleInfoSolid } from '@medusajs/icons';
import { Button, Input, Select, Text, Textarea, toast, Tooltip } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form';
import { SwitchBox } from '../../../../../components/common/switch-box';
import { RouteDrawer, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { FormExtensionZone, useDashboardExtension } from '../../../../../extensions';
import { useExtendableForm } from '../../../../../extensions/forms/hooks';
import { useUpdateProduct, useUpdateProductStatus } from '../../../../../hooks/api/products';
import { ExtendedAdminProduct } from '../../../../../types/products';

type EditProductFormProps = {
  product: ExtendedAdminProduct;
};

const EditProductSchema = zod.object({
  status: zod.string().min(1),
  title: zod.string().min(1),
  subtitle: zod.string().optional(),
  handle: zod.string().min(1),
  description: zod.string().optional(),
  discountable: zod.boolean()
});

export const EditProductForm = ({ product }: EditProductFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const { getFormFields, getFormConfigs } = useDashboardExtension();
  const fields = getFormFields('product', 'edit');
  const configs = getFormConfigs('product', 'edit');

  const form = useExtendableForm({
    defaultValues: {
      status: product.status,
      title: product.title,
      subtitle: product.subtitle || '',
      handle: product.handle || '',
      description: product.description || '',
      discountable: product.discountable
    },
    schema: EditProductSchema,
    configs: configs,
    data: product
  });

  const { mutateAsync: updateProduct, isPending: isUpdateProductPending } = useUpdateProduct(
    product.id
  );
  const { mutateAsync: updateProductStatus, isPending: isUpdateProductStatusPending } =
    useUpdateProductStatus(product.id);

  const handleSubmit = form.handleSubmit(async data => {
    const { status, description, discountable, handle, title, subtitle } = data;

    if (status !== product.status) {
      await updateProductStatus(
        {
          status
        },
        {
          onSuccess: () => {
            handleSuccess();
          },
          onError: e => {
            toast.error(e.message);
          }
        }
      );
    }

    await updateProduct(
      {
        description,
        discountable,
        handle,
        title,
        subtitle
      },
      {
        onSuccess: ({ product }) => {
          toast.success(
            t('products.edit.successToast', {
              title: product.title
            })
          );
          handleSuccess(`/products/${product.id}`);
        },
        onError: e => {
          toast.error(e.message);
        }
      }
    );
  });

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-1 flex-col gap-y-8 overflow-y-auto">
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-4">
              <Form.Field
                control={form.control}
                name="status"
                render={({ field: { onChange, ref, ...field } }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t('fields.status')}</Form.Label>
                      <Form.Control>
                        <Select
                          {...field}
                          onValueChange={onChange}
                        >
                          <Select.Trigger ref={ref}>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            {(['draft', 'published'] as const).map(status => {
                              return (
                                <Select.Item
                                  key={`status-${status}`}
                                  value={status}
                                >
                                  {t(`products.productStatus.${status}`)}
                                </Select.Item>
                              );
                            })}
                            {(['proposed', 'rejected'] as const).map(status => (
                              <Select.Item
                                key={`status-${status}`}
                                value={status}
                                className="hidden"
                              >
                                {t(`products.productStatus.${status}`)}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />
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
                name="subtitle"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label optional>{t('fields.subtitle')}</Form.Label>
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
                name="handle"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label className="flex items-center gap-x-1">
                        {t('fields.handle')}
                        <Tooltip content={t('products.fields.handle.tooltip')}>
                          <CircleInfoSolid className="text-ui-fg-muted" />
                        </Tooltip>
                      </Form.Label>
                      <Form.Control>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 z-10 flex w-8 items-center justify-center border-r">
                            <Text
                              className="text-ui-fg-muted"
                              size="small"
                              leading="compact"
                              weight="plus"
                            >
                              /
                            </Text>
                          </div>
                          <Input
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />
              {/* <Form.Field
                control={form.control}
                name='material'
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label optional>
                        {t('fields.material')}
                      </Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              /> */}
              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label optional>{t('fields.description')}</Form.Label>
                      <Form.Control>
                        <Textarea {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />
            </div>
            <SwitchBox
              control={form.control}
              name="discountable"
              label={t('fields.discountable')}
              description={t('products.discountableHint')}
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
              isLoading={isUpdateProductPending || isUpdateProductStatusPending}
            >
              {t('actions.save')}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  );
};
