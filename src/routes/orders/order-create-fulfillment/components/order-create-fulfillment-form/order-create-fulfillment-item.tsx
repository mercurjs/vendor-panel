import { useMemo } from 'react';

import { InformationCircleSolid } from '@medusajs/icons';
import { HttpTypes } from '@medusajs/types';
import { clx, Input, Text, Tooltip } from '@medusajs/ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';

import { Form } from '../../../../../components/common/form/index';
import { Thumbnail } from '../../../../../components/common/thumbnail/index';
import { useProductVariant } from '../../../../../hooks/api/products';
import { getFulfillableQuantity } from '../../../../../lib/order-item';
import { CreateFulfillmentSchema } from './constants';

type OrderEditItemProps = {
  item: HttpTypes.AdminOrderLineItem;
  currencyCode: string;
  locationId?: string;
  onItemRemove: (itemId: string) => void;
  itemReservedQuantitiesMap: Map<string | null, number>;
  form: UseFormReturn<zod.infer<typeof CreateFulfillmentSchema>>;
  disabled: boolean;
};

export function OrderCreateFulfillmentItem({
  item,
  form,
  locationId,
  itemReservedQuantitiesMap,
  disabled
}: OrderEditItemProps) {
  const { t } = useTranslation();

  const { variant } = useProductVariant(
    item.product_id!,
    item.variant_id!,
    {
      fields: '*inventory,*inventory.location_levels'
    },
    {
      enabled: !!item.variant
    }
  );

  const { availableQuantity, inStockQuantity } = useMemo(() => {
    if (!variant || !locationId) {
      return {};
    }

    const { inventory } = variant as any;

    const locationInventory = inventory?.[0]?.location_levels?.find(
      (inv: any) => inv.location_id === locationId
    );

    if (!locationInventory) {
      return {};
    }

    const reservedQuantityForItem = itemReservedQuantitiesMap.get(item.id) ?? 0;

    return {
      availableQuantity: locationInventory.available_quantity + reservedQuantityForItem,
      inStockQuantity: locationInventory.stocked_quantity
    };
  }, [variant, locationId, itemReservedQuantitiesMap]);

  const minValue = 0;
  const maxValue = Math.min(
    getFulfillableQuantity(item as any),
    availableQuantity || Number.MAX_SAFE_INTEGER
  );

  return (
    <div className="my-2 rounded-xl bg-ui-bg-subtle shadow-elevation-card-rest">
      <div className="flex flex-row items-center">
        {disabled && (
          <div className="ml-4 inline-flex items-center">
            <Tooltip
              content={t('orders.fulfillment.disabledItemTooltip')}
              side="top"
            >
              <InformationCircleSolid className="text-ui-tag-orange-icon" />
            </Tooltip>
          </div>
        )}

        <div
          className={clx(
            'flex flex-1 flex-col gap-x-2 gap-y-2 border-b p-3 text-sm sm:flex-row',
            disabled && 'pointer-events-none opacity-50'
          )}
        >
          <div className="flex flex-1 items-center gap-x-3">
            <Thumbnail src={item.thumbnail} />
            <div className="flex flex-col">
              <div>
                <Text
                  className="txt-small"
                  as="span"
                  weight="plus"
                >
                  {item.title}
                </Text>
                {item.variant_sku && <span>({item.variant_sku})</span>}
              </div>
              <Text
                as="div"
                className="txt-small text-ui-fg-subtle"
              >
                {item.variant_title}
              </Text>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-x-1">
            <div className="mr-2 block h-[16px] w-[2px] bg-gray-200" />

            <div className="text-small flex flex-1 flex-col">
              <span className="font-medium text-ui-fg-subtle">
                {t('orders.fulfillment.available')}
              </span>
              <span className="text-ui-fg-subtle">{availableQuantity || 'N/A'}</span>
            </div>

            <div className="flex flex-1 items-center gap-x-1">
              <div className="mr-2 block h-[16px] w-[2px] bg-gray-200" />

              <div className="flex flex-col">
                <span className="font-medium text-ui-fg-subtle">
                  {t('orders.fulfillment.inStock')}
                </span>
                <span className="text-ui-fg-subtle">
                  {inStockQuantity || 'N/A'}{' '}
                  {inStockQuantity && (
                    <span className="font-medium text-red-500">
                      -{form.getValues(`quantity.${item.id}`)}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-1">
              <Form.Field
                control={form.control}
                name={`quantity.${item.id}`}
                rules={{
                  required: true,
                  min: minValue,
                  max: maxValue
                }}
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Control>
                        <Input
                          className="txt-small w-[50px] rounded-lg bg-ui-bg-base text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          {...field}
                          onChange={e => {
                            const val = e.target.value === '' ? null : Number(e.target.value);

                            field.onChange(val);

                            if (val !== null && !isNaN(val ?? 0)) {
                              if (val < minValue || val > maxValue) {
                                form.setError(`quantity.${item.id}`, {
                                  type: 'manual',
                                  message: t('orders.fulfillment.error.wrongQuantity', {
                                    count: maxValue,
                                    number: maxValue
                                  })
                                });
                              } else {
                                form.clearErrors(`quantity.${item.id}`);
                              }
                            }
                          }}
                        />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  );
                }}
              />

              <span className="text-ui-fg-subtle">
                / {item.quantity} {t('fields.qty')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
