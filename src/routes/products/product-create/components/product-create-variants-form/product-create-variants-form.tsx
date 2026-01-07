import { useCallback, useEffect, useMemo, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { Checkbox } from '@medusajs/ui';
import { ColumnDef } from '@tanstack/react-table';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { InlineTipWrapper } from '../../../../../components/common/inline-tip-wrapper';
import {
  createDataGridHelper,
  createDataGridPriceColumns,
  DataGrid
} from '../../../../../components/data-grid';
import { DataGridMediaCell } from '../../../../../components/data-grid/components/data-grid-media-cell';
import { useAttributes } from '../../../../../hooks/api/attributes';
import { useStockLocations } from '../../../../../hooks/api/stock-locations';
import { ProductCreateVariantSchema } from '../../constants';
import { ProductCreateSchemaType } from '../../types';
import { decorateVariantsWithDefaultValues } from '../../utils';

type ProductCreateVariantsFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  store?: HttpTypes.AdminStore;
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
  onOpenMediaModal?: (variantIndex: number, variantTitle?: string, initialMedia?: any[]) => void;
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

    // First, add required single-value attributes (default useForVariants: true)
    allAttributes.forEach((attr: any) => {
      if (attr.is_required && attr.ui_component !== 'multivalue') {
        const value = (formValues as any)?.[attr.handle];

        if (value !== undefined && value !== null && value !== '') {
          let actualValue = value;

          // If it's a select value, convert ID to actual value
          if (attr.possible_values && typeof value === 'string') {
            const possibleValue = attr.possible_values.find((pv: any) => pv.id === value);
            if (possibleValue) {
              actualValue = possibleValue.value;
            }
          }

          // Single-value attributes default to useForVariants: true
          result.push({
            handle: attr.handle,
            name: attr.name,
            selectedValues: [{ id: String(value), value: String(actualValue) }]
          });
        }
      }
    });

    // Then, add required multivalue attributes (always use for variants - locked to true)
    allAttributes.forEach((attr: any) => {
      if (attr.ui_component === 'multivalue') {
        const selectedValueIds = (formValues as any)?.[attr.handle];

        if (
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

    // Finally, add user-created options (always use for variants - locked to true)
    // Only include options with metadata === 'user-created' to exclude default options
    const options = (formValues as any)?.options || [];
    options.forEach((option: any) => {
      if (
        option?.metadata === 'user-created' &&
        option?.title &&
        option?.values &&
        Array.isArray(option.values) &&
        option.values.length > 0
      ) {
        // Only include user-created options (exclude default options)
        result.push({
          handle: `option-${option.title}`, // Use title as handle for options
          name: option.title,
          selectedValues: option.values.map((value: string) => ({ id: value, value }))
        });
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
    onOpenMediaModal,
    form
  });

  const variantData = useMemo(() => {
    const ret: VariantWithIndex[] = [];

    if (variantAttributes.length > 0) {
      const totalCombinations = variantAttributes.reduce(
        (acc, attr) => acc * attr.selectedValues.length,
        1
      );

      for (let i = 0; i < totalCombinations; i++) {
        // Build options object for this variant based on variantAttributes
        const variantOptions: Record<string, string> = {};
        variantAttributes.forEach(attr => {
          let valueIndex = 0;
          let divisor = 1;

          for (let j = variantAttributes.length - 1; j >= 0; j--) {
            if (variantAttributes[j].handle === attr.handle) {
              valueIndex = Math.floor(i / divisor) % attr.selectedValues.length;
              break;
            }
            divisor *= variantAttributes[j].selectedValues.length;
          }

          variantOptions[attr.name] = attr.selectedValues[valueIndex]?.value || '';
        });

        // Generate automatic title based on variant attributes (after building options)
        const autoTitle = variantAttributes
          .map(attr => variantOptions[attr.name])
          .filter(Boolean)
          .join(' / ');

        // Check if this variant already exists in the form - match by options, not title
        const existingVariant = variants.find(v => {
          if (!v.options) return false;
          return variantAttributes.every(attr => {
            return v.options[attr.name] === variantOptions[attr.name];
          });
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
          title: autoTitle, // Always use autoTitle to ensure it includes all current variantAttributes
          should_create: existingVariant?.should_create ?? true,
          variant_rank: i,
          options: variantOptions, // Always use variantOptions to ensure it includes all current variantAttributes
          sku: existingVariant?.sku || '',
          prices: existingVariant?.prices || {},
          manage_inventory: existingVariant?.manage_inventory ?? true,
          allow_backorder: existingVariant?.allow_backorder ?? false,
          is_default: i === 0,
          media: existingVariant?.media || [], // Preserve media
          originalIndex: existingVariant ? variants.indexOf(existingVariant) : i
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
            originalIndex: i
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
        // Build options object for this variant based on variantAttributes
        const variantOptions: Record<string, string> = {};
        variantAttributes.forEach(attr => {
          let valueIndex = 0;
          let divisor = 1;

          for (let j = variantAttributes.length - 1; j >= 0; j--) {
            if (variantAttributes[j].handle === attr.handle) {
              valueIndex = Math.floor(i / divisor) % attr.selectedValues.length;
              break;
            }
            divisor *= variantAttributes[j].selectedValues.length;
          }

          variantOptions[attr.name] = attr.selectedValues[valueIndex]?.value || '';
        });

        // Generate automatic title based on variant attributes (after building options)
        const autoTitle = variantAttributes
          .map(attr => variantOptions[attr.name])
          .filter(Boolean)
          .join(' / ');

        // Check if this variant already exists and preserve its state
        // Match by comparing options instead of title
        const existingVariant = currentVariants.find(v => {
          if (!v.options) return false;
          return variantAttributes.every(attr => {
            return v.options[attr.name] === variantOptions[attr.name];
          });
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

        newVariants.push({
          title: autoTitle, // Always use autoTitle to ensure it includes all current variantAttributes
          should_create: existingVariant?.should_create ?? true,
          variant_rank: i,
          options: variantOptions, // Always use variantOptions to ensure it includes all current variantAttributes
          sku: existingVariant?.sku || '',
          prices: existingVariant?.prices || {},
          manage_inventory: existingVariant?.manage_inventory ?? true,
          allow_backorder: existingVariant?.allow_backorder ?? false,
          is_default: i === 0,
          media: existingVariant?.media || [], // Preserve media when regenerating variants
          stock_locations: stockLocationsData
        });
      }

      form.setValue('variants', newVariants);
    } else {
      // When no variant attributes are selected, only create default variant if variants are empty
      // This prevents overwriting existing variants unnecessarily
      const currentVariants = form.getValues('variants') || [];
      
      // Only create default variant if there are no variants at all
      if (currentVariants.length === 0) {
        const stockLocationsData: Record<string, any> = {};
        stock_locations.forEach((location: any) => {
          stockLocationsData[location.id] = {
            id: undefined,
            quantity: '',
            checked: false,
            disabledToggle: false
          };
        });

        const defaultVariant = decorateVariantsWithDefaultValues([
          {
            title: 'Default variant',
            should_create: true,
            variant_rank: 0,
            options: {},
            sku: '',
            prices: {},
            manage_inventory: true,
            allow_backorder: false,
            is_default: true,
            media: []
          }
        ]);

        form.setValue('variants', defaultVariant);
      } else {
        // If variants exist but no variant attributes, clear them (user unselected all variant attributes)
        form.setValue('variants', []);
      }
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
  onOpenMediaModal,
  form
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
  onOpenMediaModal?: (variantIndex: number, variantTitle?: string, initialMedia?: any[]) => void;
  form: UseFormReturn<ProductCreateSchemaType>;
}) => {
  const { t } = useTranslation();

  const variants = useWatch({
    control: form.control,
    name: 'variants',
    defaultValue: []
  });

  const allSelected = variants.length > 0 && variants.every((v) => v.should_create);
  const someSelected = variants.some((v) => v.should_create) && !allSelected;

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const currentVariants = form.getValues('variants') || [];
      const updatedVariants = currentVariants.map((v) => ({
        ...v,
        should_create: checked
      }));
      form.setValue('variants', updatedVariants);
    },
    [form]
  );

  return useMemo(
    () => [
      // Checkbox column
      columnHelper.column({
        id: 'checkbox',
        header: () => {
          return (
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={handleSelectAll}
            />
          );
        },
        field: context => {
          const rowData = context.row.original as VariantWithIndex;
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
      // Single readonly column showing all option values combined (e.g., "Color / Material") - first
      columnHelper.column({
        id: 'options_combined',
        name: variantAttributes.length > 0 ? variantAttributes.map(attr => attr.name).join(' / ') : 'Options',
        header: variantAttributes.length > 0 ? variantAttributes.map(attr => attr.name).join(' / ') : 'Options',
        cell: context => {
          if (variantAttributes.length === 0) {
            return <DataGrid.ReadonlyCell context={context}></DataGrid.ReadonlyCell>;
          }
          const rowData = context.row.original as VariantWithIndex;
          const combinedValue = variantAttributes
            .map(attr => rowData.options?.[attr.name] || '')
            .filter(Boolean)
            .join(' / ');
          return (
            <DataGrid.ReadonlyCell context={context}>{combinedValue}</DataGrid.ReadonlyCell>
          );
        },
        disableHiding: true,
        pin: 'left'
      }),
      // Title column (editable) - second (after variant)
      columnHelper.column({
        id: 'title',
        name: t('fields.title'),
        header: t('fields.title'),
        field: context => {
          const rowData = context.row.original as VariantWithIndex;
          return `variants.${rowData.originalIndex}.title`;
        },
        type: 'text',
        cell: context => {
          return <DataGrid.TextCell context={context} />;
        },
        disableHiding: true,
        pin: 'left'
      }),
      // Media column - third
      columnHelper.column({
        id: 'media',
        name: t('products.create.variants.productVariants.media'),
        header: t('products.create.variants.productVariants.media'),
        field: context => {
          const rowData = context.row.original as VariantWithIndex;
          return `variants.${rowData.originalIndex}.media`;
        },
        type: 'media',
        cell: context => {
          const rowData = context.row.original as VariantWithIndex;
          const variantMedia = variants[rowData.originalIndex]?.media;
          return (
            <DataGridMediaCell
              context={context}
              onOpenMediaModal={() => {
                onOpenMediaModal?.(rowData.originalIndex, rowData.title, variantMedia);
              }}
            />
          );
        }
      }),
      columnHelper.column({
        id: 'sku',
        name: t('fields.sku'),
        header: t('fields.sku'),
        field: context => {
          const rowData = context.row.original as VariantWithIndex;
          return `variants.${rowData.originalIndex}.sku`;
        },
        type: 'text',
        cell: context => {
          return <DataGrid.TextCell context={context} />;
        }
      }),
      ...createDataGridPriceColumns<VariantWithIndex, ProductCreateSchemaType>({
        currencies: store?.supported_currencies?.map((c) => c.currency_code) || [],
        pricePreferences,
        getFieldName: (context, value) => {
          const rowData = context.row.original as VariantWithIndex;
          return `variants.${rowData.originalIndex}.prices.${value}`;
        },
        t
      }),
      // Stock location columns - commented out for now
      // ...stockLocations.map(location =>
      //   columnHelper.column({
      //     id: `stock_location_${location.id}`,
      //     name: location.name,
      //     header: location.name,
      //     field: context => {
      //       const rowData = context.row.original as any;
      //       return `variants.${rowData.originalIndex}.stock_locations.${location.id}` as any;
      //     },
      //     type: 'togglable-number',
      //     cell: context => {
      //       return (
      //         <DataGridTogglableNumberCell
      //           context={context}
      //           disabledToggleTooltip={t('inventory.stock.disabledToggleTooltip')}
      //         />
      //       );
      //     }
      //   })
      // )
    ] as ColumnDef<VariantWithIndex>[],
    [
      variantAttributes,
      t,
      store,
      regions,
      pricePreferences,
      stockLocations,
      onOpenMediaModal,
      allSelected,
      someSelected,
      handleSelectAll
    ]
  );
};
