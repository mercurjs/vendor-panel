import { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AdminPromotion } from '@medusajs/types';
import { Button, Input, RadioGroup, Text, Textarea } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form';
import { DeprecatedPercentageInput } from '../../../../../components/inputs/percentage-input';
import { RouteDrawer, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import {
  useUpdatePromotion,
  useUpdatePromotionMetadata
} from '../../../../../hooks/api/promotions';

type EditPromotionFormProps = {
  promotion: AdminPromotion;
};

const EditPromotionSchema = zod.object({
  is_automatic: zod.string().toLowerCase(),
  code: zod.string().min(1),
  title: zod.string().optional(),
  status: zod.enum(['active', 'inactive', 'draft']),
  value_type: zod.enum(['fixed', 'percentage']),
  value: zod.number(),
  max_quantity: zod.number().min(1).optional().nullable(),
  description: zod.string().optional(),
  conditions: zod.string().optional(),
  min_purchase: zod.number().min(0).optional().or(zod.string().optional())
});

export const EditPromotionDetailsForm = ({ promotion }: EditPromotionFormProps) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();

  const form = useForm<zod.infer<typeof EditPromotionSchema>>({
    defaultValues: {
      is_automatic: promotion.is_automatic!.toString(),
      code: promotion.code,
      title: (promotion.metadata?.title as string) || '',
      status: promotion.status,
      value: promotion.application_method!.value,
      value_type: promotion.application_method!.type,
      max_quantity: promotion.application_method?.max_quantity ?? 1,
      description: (promotion.metadata?.description as string) || '',
      conditions: (promotion.metadata?.conditions as string) || '',
      min_purchase: (promotion.metadata?.min_purchase as string | number) || ''
    },
    resolver: zodResolver(EditPromotionSchema)
  });

  const { mutateAsync, isPending } = useUpdatePromotion(promotion.id);
  const { mutateAsync: updateMetadata } = useUpdatePromotionMetadata();

  const handleSubmit = form.handleSubmit(async data => {
    await mutateAsync(
      {
        is_automatic: data.is_automatic === 'true',
        code: data.code,
        status: data.status,
        application_method: {
          value: data.value,
          max_quantity: data.max_quantity
        }
      },
      {
        onSuccess: async () => {
          if (
            data.title !== (promotion.metadata?.title || '') ||
            data.description !== (promotion.metadata?.description || '') ||
            data.conditions !== (promotion.metadata?.conditions || '') ||
            data.min_purchase !== (promotion.metadata?.min_purchase || '')
          ) {
            try {
              await updateMetadata({
                id: promotion.id,
                metadata: {
                  title: data.title,
                  description: data.description,
                  conditions: data.conditions,
                  min_purchase: data.min_purchase ? parseFloat(data.min_purchase as string) : null
                }
              });
            } catch (e) {
              console.error('Failed to update promotion metadata', e);
              toast.error(
                'Details updated but failed to save title/description/conditions/min_purchase'
              );
            }
          }
          handleSuccess();
        }
      }
    );
  });

  useEffect(() => {
    if (promotion) {
      form.reset({
        is_automatic: promotion.is_automatic!.toString(),
        code: promotion.code,
        title: (promotion.metadata?.title as string) || '',
        status: promotion.status,
        value: promotion.application_method!.value,
        allocation: (promotion.application_method?.allocation as any) || 'each',
        value_type: promotion.application_method!.type,
        max_quantity: promotion.application_method?.max_quantity ?? 1,
        description: (promotion.metadata?.description as string) || '',
        conditions: (promotion.metadata?.conditions as string) || '',
        min_purchase: (promotion.metadata?.min_purchase as string | number) || ''
      });
    }
  }, [promotion, form]);

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-1 flex-col gap-y-8 overflow-y-auto">
          <div className="flex flex-col gap-y-8">
            <Form.Field
              control={form.control}
              name="status"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t('promotions.form.status.label')}</Form.Label>
                    <Form.Control>
                      <RadioGroup
                        className="flex-col gap-y-3"
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <RadioGroup.ChoiceBox
                          value={'draft'}
                          label={t('promotions.form.status.draft.title')}
                          description={t('promotions.form.status.draft.description')}
                        />

                        <RadioGroup.ChoiceBox
                          value={'active'}
                          label={t('promotions.form.status.active.title')}
                          description={t('promotions.form.status.active.description')}
                        />

                        <RadioGroup.ChoiceBox
                          value={'inactive'}
                          label={t('promotions.form.status.inactive.title')}
                          description={t('promotions.form.status.inactive.description')}
                        />
                      </RadioGroup>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <Form.Field
              control={form.control}
              name="is_automatic"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t('promotions.form.method.label')}</Form.Label>
                    <Form.Control>
                      <RadioGroup
                        className="flex-col gap-y-3"
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <RadioGroup.ChoiceBox
                          value={'false'}
                          label={t('promotions.form.method.code.title')}
                          description={t('promotions.form.method.code.description')}
                        />
                        <RadioGroup.ChoiceBox
                          value={'true'}
                          label={t('promotions.form.method.automatic.title')}
                          description={t('promotions.form.method.automatic.description')}
                        />
                      </RadioGroup>
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            <div className="flex flex-col gap-y-4">
              <Form.Field
                control={form.control}
                name="code"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t('promotions.form.code.title')}</Form.Label>

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
                name="title"
                render={({ field }) => {
                  return (
                    <Form.Item data-testid="promotion-edit-details-form-title-item">
                      <Form.Label data-testid="promotion-edit-details-form-title-label">
                        Coupon Title
                      </Form.Label>
                      <Form.Control data-testid="promotion-edit-details-form-title-control">
                        <Input
                          {...field}
                          placeholder="e.g. Welcome Discount"
                          data-testid="promotion-edit-details-form-title-input"
                        />
                      </Form.Control>
                      <Form.ErrorMessage data-testid="promotion-edit-details-form-title-error" />
                    </Form.Item>
                  );
                }}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>Description</Form.Label>
                      <Form.Control>
                        <Textarea {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />

              <Form.Field
                control={form.control}
                name="conditions"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>Conditions</Form.Label>
                      <Form.Control>
                        <Textarea {...field} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />

              <Form.Field
                control={form.control}
                name="min_purchase"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>Minimum Purchase Amount</Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          type="number"
                          min={0}
                          placeholder="0.00"
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />

              <Text
                size="small"
                leading="compact"
                className="text-ui-fg-subtle"
              >
                <Trans
                  t={t}
                  i18nKey="promotions.form.code.description"
                  components={[<br key="break" />]}
                />
              </Text>
            </div>

            <Form.Field
              control={form.control}
              name="value"
              render={({ field: { onChange, ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Label>{t('fields.percentage')}</Form.Label>
                    <Form.Control>
                      <DeprecatedPercentageInput
                        key="amount"
                        min={0}
                        max={100}
                        {...field}
                        value={field.value || ''}
                        onChange={e => {
                          onChange(e.target.value === '' ? null : parseInt(e.target.value));
                        }}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                );
              }}
            />

            {promotion.application_method?.allocation === 'each' && (
              <Form.Field
                control={form.control}
                name="max_quantity"
                render={() => {
                  return (
                    <Form.Item>
                      <Form.Label>{t('promotions.form.max_quantity.title')}</Form.Label>
                      <Form.Control>
                        <Input
                          {...form.register('max_quantity', {
                            valueAsNumber: true
                          })}
                          type="number"
                          min={1}
                          placeholder="999"
                        />
                      </Form.Control>
                      <Text
                        size="small"
                        leading="compact"
                        className="text-ui-fg-subtle"
                      >
                        <Trans
                          t={t}
                          i18nKey="promotions.form.max_quantity.description"
                          components={[<br key="break" />]}
                        />
                      </Text>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />
            )}
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
