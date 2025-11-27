import { useEffect, useMemo, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { InlineTipWrapper } from '../../../../../components/common/inline-tip-wrapper';
import {
  createDataGridHelper,
  createDataGridPriceColumns,
  DataGrid
} from '../../../../../components/data-grid';
import { DataGridMediaCell } from '../../../../../components/data-grid/components/data-grid-media-cell';
import { DataGridTogglableNumberCell } from '../../../../../components/data-grid/components/data-grid-toggleable-number-cell';
import { useAttributes } from '../../../../../hooks/api/attributes';
import { useStockLocations } from '../../../../../hooks/api/stock-locations';
import { ProductCreateVariantSchema } from '../../constants';
import { ProductCreateSchemaType } from '../../types';

type ProductCreateVariantsFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  store?: HttpTypes.AdminStore;
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
  onOpenMediaModal?: () => void;
};

type VariantWithIndex = ProductCreateVariantSchema & {
  originalIndex: number;
};

export const ProductCreateVariantsForm = ({
  form,
  store,
  regions = [],
  pricePreferences = [],
  onOpenMediaModal
}: ProductCreateVariantsFormProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  const variants = useWatch({
    control: form.control,
    name: 'variants',
    defaultValue: []
  });

  const attributesResult = useAttributes();
  const allAttributes = (attributesResult as any).attributes || [];

  const { stock_locations = [] } = useStockLocations({
    limit: 9999,
    fields: 'id,name'
  });

  // Watch all form values to get attribute data
  const formValues = useWatch({
    control: form.control
  });

  const variantAttributes = useMemo(() => {
    const result: Array<{
      handle: string;
      name: string;
      selectedValues: Array<{ id: string; value: string }>;
    }> = [];

    allAttributes.forEach((attr: any) => {
      if (attr.ui_component === 'multivalue') {
        const useForVariantsField = `${attr.handle}UseForVariants`;
        const isUsedForVariants = (formValues as any)?.[useForVariantsField];
        const selectedValueIds = (formValues as any)?.[attr.handle];

        if (
          isUsedForVariants &&
          selectedValueIds &&
          Array.isArray(selectedValueIds) &&
          selectedValueIds.length > 0
        ) {
          const selectedValues = selectedValueIds
            .map((valueId: string) => {
              const possibleValue = attr.possible_values?.find((pv: any) => pv.id === valueId);
              return possibleValue ? { id: valueId, value: possibleValue.value } : null;
            })
            .filter((item): item is { id: string; value: string } => item !== null);

          if (selectedValues.length > 0) {
            result.push({
              handle: attr.handle,
              name: attr.name,
              selectedValues
            });
          }
        }
      }
    });

    return result;
  }, [allAttributes, formValues]);

  /**
   * NOTE: anything that goes to the datagrid component needs to be memoised otherwise DataGrid will rerender and inputs will loose focus
   */
  const columns = useColumns({
    variantAttributes,
    store,
    regions,
    pricePreferences,
    stockLocations: stock_locations,
    onOpenMediaModal
  });

  const variantData = useMemo(() => {
    const ret: VariantWithIndex[] = [];

    if (variantAttributes.length > 0) {
      const totalCombinations = variantAttributes.reduce(
        (acc, attr) => acc * attr.selectedValues.length,
        1
      );

      for (let i = 0; i < totalCombinations; i++) {
        // Generate automatic title based on variant attributes
        const autoTitle = variantAttributes
          .map(attr => {
            let valueIndex = 0;
            let divisor = 1;

            for (let j = variantAttributes.length - 1; j >= 0; j--) {
              if (variantAttributes[j].handle === attr.handle) {
                valueIndex = Math.floor(i / divisor) % attr.selectedValues.length;
                break;
              }
              divisor *= variantAttributes[j].selectedValues.length;
            }

            return attr.selectedValues[valueIndex]?.value || '';
          })
          .filter(Boolean)
          .join(' / ');

        // Check if this variant already exists in the form
        const existingVariant = variants.find((v, index) => {
          if (v.should_create) {
            const existingTitle = variantAttributes
              .map(attr => {
                let valueIndex = 0;
                let divisor = 1;

                for (let j = variantAttributes.length - 1; j >= 0; j--) {
                  if (variantAttributes[j].handle === attr.handle) {
                    valueIndex = Math.floor(index / divisor) % attr.selectedValues.length;
                    break;
                  }
                  divisor *= variantAttributes[j].selectedValues.length;
                }

                return attr.selectedValues[valueIndex]?.value || '';
              })
              .filter(Boolean)
              .join(' / ');
            return existingTitle === autoTitle;
          }
          return false;
        });

        const stockLocationsData: Record<string, any> = {};
        stock_locations.forEach((location: any) => {
          stockLocationsData[location.id] = {
            id: undefined,
            quantity: '',
            checked: false,
            disabledToggle: false
          };
        });

        ret.push({
          title: autoTitle,
          should_create: true,
          variant_rank: i,
          options: {},
          sku: '',
          prices: {},
          manage_inventory: true,
          allow_backorder: false,
          is_default: i === 0,
          originalIndex: existingVariant ? variants.indexOf(existingVariant) : i,
          autoGeneratedTitle: autoTitle,
          stock_locations: stockLocationsData
        });
      }
    } else {
      // Fallback to existing variants
      variants.forEach((v, i) => {
        if (v.should_create) {
          const stockLocationsData: Record<string, any> = {};
          stock_locations.forEach((location: any) => {
            stockLocationsData[location.id] = {
              id: undefined,
              quantity: '',
              checked: false,
              disabledToggle: false
            };
          });

          ret.push({
            ...v,
            originalIndex: i,
            autoGeneratedTitle: v.title || 'Default variant',
            stock_locations: stockLocationsData
          });
        }
      });
    }

    return ret;
  }, [variants, variantAttributes, stock_locations]);

  // Filter variant data based on search
  const filteredVariantData = useMemo(() => {
    if (!searchValue.trim()) return variantData;

    return variantData.filter(variant =>
      variant.title.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [variantData, searchValue]);

  // Update form variants when variantAttributes structure changes (not on every checkbox update)
  const variantStructureKey = useMemo(() => {
    return variantAttributes
      .map(attr => `${attr.handle}:${attr.selectedValues.map(v => v.id).join(',')}`)
      .join('|');
  }, [variantAttributes]);

  useEffect(() => {
    if (variantAttributes.length > 0) {
      const totalCombinations = variantAttributes.reduce(
        (acc, attr) => acc * attr.selectedValues.length,
        1
      );
      const currentVariants = form.getValues('variants') || [];
      const newVariants = [];

      for (let i = 0; i < totalCombinations; i++) {
        const autoTitle = variantAttributes
          .map(attr => {
            let valueIndex = 0;
            let divisor = 1;

            for (let j = variantAttributes.length - 1; j >= 0; j--) {
              if (variantAttributes[j].handle === attr.handle) {
                valueIndex = Math.floor(i / divisor) % attr.selectedValues.length;
                break;
              }
              divisor *= variantAttributes[j].selectedValues.length;
            }

            return attr.selectedValues[valueIndex]?.value || '';
          })
          .filter(Boolean)
          .join(' / ');

        // Check if this variant already exists and preserve its state
        const existingVariant = currentVariants.find(v => v.title === autoTitle);

        const stockLocationsData: Record<string, any> = {};
        stock_locations.forEach((location: any) => {
          stockLocationsData[location.id] = {
            id: undefined,
            quantity: '',
            checked: false,
            disabledToggle: false
          };
        });

        newVariants.push({
          title: autoTitle,
          should_create: existingVariant ? existingVariant.should_create : true,
          variant_rank: i,
          options: existingVariant?.options || {},
          sku: existingVariant?.sku || '',
          prices: existingVariant?.prices || {},
          manage_inventory: existingVariant?.manage_inventory ?? true,
          allow_backorder: existingVariant?.allow_backorder ?? false,
          is_default: i === 0,
          stock_locations: stockLocationsData
        });
      }

      form.setValue('variants', newVariants);
    }
  }, [variantStructureKey, form, stock_locations]);

  // Don't render DataGrid until stock locations are loaded
  if (stock_locations.length === 0) {
    return (
      <div className="flex size-full flex-col divide-y overflow-hidden">
        <div className="flex h-32 items-center justify-center">
          <span className="text-ui-fg-muted">Loading stock locations...</span>
        </div>
        <InlineTipWrapper description={t('products.create.variants.productVariants.tip')} />
      </div>
    );
  }

  return (
    <div className="border-ui-border flex h-full flex-col justify-between divide-y">
      <DataGrid
        columns={columns}
        data={filteredVariantData}
        state={form}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={t('products.create.variants.productVariants.searchPlaceholder')}
      />
      <InlineTipWrapper description={t('products.create.variants.productVariants.tip')} />
    </div>
  );
};

const columnHelper = createDataGridHelper<VariantWithIndex, ProductCreateSchemaType>();

const useColumns = ({
  variantAttributes = [],
  store,
  regions = [],
  pricePreferences = [],
  stockLocations = [],
  onOpenMediaModal
}: {
  variantAttributes?: Array<{
    handle: string;
    name: string;
    selectedValues: Array<{ id: string; value: string }>;
  }>;
  store?: HttpTypes.AdminStore;
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
  stockLocations?: HttpTypes.AdminStockLocation[];
  onOpenMediaModal?: () => void;
}) => {
  const { t } = useTranslation();

  return useMemo(
    () => [
      // Checkbox column
      columnHelper.column({
        id: 'checkbox',
        header: () => null,
        field: context => {
          const rowData = context.row.original as any;
          return `variants.${rowData.originalIndex}.should_create`;
        },
        type: 'boolean',
        cell: context => {
          return <DataGrid.BooleanCell context={context} />;
        },
        disableHiding: true,
        size: 52,
        pin: 'left'
      }),
      columnHelper.column({
        id: 'title',
        name: t('fields.title'),
        header: t('fields.title'),
        field: context => {
          const rowData = context.row.original as any;
          return `variants.${rowData.originalIndex}.title`;
        },
        type: 'text',
        cell: context => {
          const rowData = context.row.original as any;
          return (
            <DataGrid.ReadonlyCell context={context}>
              {rowData.autoGeneratedTitle}
            </DataGrid.ReadonlyCell>
          );
        },
        disableHiding: true,
        pin: 'left'
      }),
      columnHelper.column({
        id: 'sku',
        name: t('fields.sku'),
        header: t('fields.sku'),
        field: context => {
          const rowData = context.row.original as any;
          return `variants.${rowData.originalIndex}.sku`;
        },
        type: 'text',
        cell: context => {
          return <DataGrid.TextCell context={context} />;
        }
      }),
      ...createDataGridPriceColumns<ProductCreateVariantSchema, ProductCreateSchemaType>({
        currencies: store?.supported_currencies?.map((c: any) => c.currency_code) || [],
        regions,
        pricePreferences,
        getFieldName: (context, value) => {
          const rowData = context.row.original as any;
          return `variants.${rowData.originalIndex}.prices.${value}`;
        },
        t
      }),
      columnHelper.column({
        id: 'media',
        name: t('products.create.variants.productVariants.media'),
        header: t('products.create.variants.productVariants.media'),
        field: context => {
          const rowData = context.row.original as any;
          return `variants.${rowData.originalIndex}.media`;
        },
        type: 'media',
        cell: context => {
          return (
            <DataGridMediaCell
              context={context}
              onOpenMediaModal={onOpenMediaModal}
              disabled
            />
          );
        }
      }),
      ...stockLocations.map(location =>
        columnHelper.column({
          id: `stock_location_${location.id}`,
          name: location.name,
          header: location.name,
          field: context => {
            const rowData = context.row.original as any;
            return `variants.${rowData.originalIndex}.stock_locations.${location.id}` as any;
          },
          type: 'togglable-number',
          cell: context => {
            return (
              <DataGridTogglableNumberCell
                context={context}
                disabledToggleTooltip={t('inventory.stock.disabledToggleTooltip')}
              />
            );
          }
        })
      )
    ],
    [variantAttributes, t, store, regions, pricePreferences, stockLocations, onOpenMediaModal]
  );
};
