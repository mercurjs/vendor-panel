import { useEffect, useMemo, useRef, useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { Button, ProgressStatus, ProgressTabs, toast } from '@medusajs/ui';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { RouteFocusModal, useRouteModal } from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { useDashboardExtension, useExtendableForm } from '../../../../../extensions';
import { useRegions } from '../../../../../hooks/api';
import { useAttributes } from '../../../../../hooks/api/attributes';
import { useBatchInventoryItemLocationLevels } from '../../../../../hooks/api/inventory';
import { usePricePreferences } from '../../../../../hooks/api/price-preferences';
import { useCreateProduct } from '../../../../../hooks/api/products';
import { useStockLocations } from '../../../../../hooks/api/stock-locations';
import { uploadFilesQuery } from '../../../../../lib/client';
import { PRODUCT_CREATE_FORM_DEFAULTS, ProductCreateSchema } from '../../constants';
import { ProductCreateSchemaType } from '../../types';
import {
  ProductCreateAttributesForm,
  ProductCreateAttributesFormRef
} from '../product-create-attributes-form/product-create-attributes-form';
import { ProductCreateDetailsForm } from '../product-create-details-form';
import { ProductCreateInventoryKitForm } from '../product-create-inventory-kit-form';
import { ProductCreateOrganizeForm } from '../product-create-organize-form';
import { ProductCreateVariantsForm } from '../product-create-variants-form';

enum Tab {
  DETAILS = 'details',
  ORGANIZE = 'organize',
  ATTRIBUTES = 'attributes',
  VARIANTS = 'variants',
  INVENTORY = 'inventory'
}

type TabState = Record<Tab, ProgressStatus>;

const SAVE_DRAFT_BUTTON = 'save-draft-button';

// Tab order for determining navigation direction
const TAB_ORDER: Tab[] = [Tab.DETAILS, Tab.ORGANIZE, Tab.ATTRIBUTES, Tab.VARIANTS, Tab.INVENTORY];

// Helper function to check if we're moving forward
const isMovingForward = (currentTab: Tab, newTab: Tab): boolean => {
  const currentIndex = TAB_ORDER.indexOf(currentTab);
  const newIndex = TAB_ORDER.indexOf(newTab);
  return newIndex > currentIndex;
};

type ProductCreateFormProps = {
  defaultChannel?: HttpTypes.AdminSalesChannel;
  store?: HttpTypes.AdminStore;
  pricePreferences?: HttpTypes.AdminPricePreference[];
  onOpenMediaModal?: () => void;
};

export const ProductCreateForm = ({
  defaultChannel,
  store,
  onOpenMediaModal
}: ProductCreateFormProps) => {
  const [tab, setTab] = useState<Tab>(Tab.DETAILS);
  const [maxReachedTab, setMaxReachedTab] = useState<Tab>(Tab.DETAILS);
  const [tabState, setTabState] = useState<TabState>({
    [Tab.DETAILS]: 'in-progress',
    [Tab.ORGANIZE]: 'not-started',
    [Tab.ATTRIBUTES]: 'not-started',
    [Tab.VARIANTS]: 'not-started',
    [Tab.INVENTORY]: 'not-started'
  });

  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const { getFormConfigs } = useDashboardExtension();
  const configs = getFormConfigs('product', 'create');

  const { regions } = useRegions({ limit: 9999 });
  const { price_preferences: pricePreferences } = usePricePreferences({
    limit: 9999
  });

  const { attributes: allAttributes } = useAttributes({
    fields:
      'id,name,handle,description,ui_component,is_required,product_categories.*,possible_values.*'
  });

  const { stock_locations = [] } = useStockLocations({
    limit: 9999,
    fields: 'id,name'
  });

  const dynamicAttributeSchema = useMemo(() => {
    const attributeFields: Record<string, z.ZodTypeAny> = {};

    allAttributes?.forEach((attr: any) => {
      switch (attr.ui_component) {
        case 'multivalue':
          attributeFields[attr.handle] = z.array(z.string()).optional();
          attributeFields[`${attr.handle}UseForVariants`] = z.boolean().optional();
          break;
        case 'select':
        case 'text':
        case 'text_area':
          attributeFields[attr.handle] = z.string().optional();
          break;
        case 'unit':
          attributeFields[attr.handle] = z.union([z.string(), z.number()]).optional();
          break;
        case 'toggle':
          attributeFields[attr.handle] = z.string().optional();
          break;
      }
    });

    return attributeFields;
  }, [allAttributes]);

  const dynamicStockLocationSchema = useMemo(() => {
    const stockLocationFields: Record<string, z.ZodTypeAny> = {};

    stock_locations?.forEach((location: any) => {
      stockLocationFields[`stock_locations.${location.id}`] = z
        .object({
          id: z.string().optional(),
          quantity: z.union([z.number(), z.string()]).optional(),
          checked: z.boolean().optional(),
          disabledToggle: z.boolean().optional()
        })
        .optional();
    });

    return stockLocationFields;
  }, [stock_locations]);

  // Extend the base schema with dynamic attribute fields
  const extendedSchema = useMemo(() => {
    const baseSchema = ProductCreateSchema.innerType();
    const extendedBaseSchema = baseSchema.extend({
      ...dynamicAttributeSchema,
      ...dynamicStockLocationSchema
    });

    return extendedBaseSchema.superRefine((data, ctx) => {
      if (data.variants.every((v: any) => !v.should_create)) {
        return ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['variants'],
          message: 'invalid_length'
        });
      }

      const skus = new Set<string>();
      data.variants.forEach((v: any, index: any) => {
        if (v.sku) {
          if (skus.has(v.sku)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [`variants.${index}.sku`],
              message: 'SKU must be unique'
            });
          }
          skus.add(v.sku);
        }
      });
    });
  }, [dynamicAttributeSchema]);

  const dynamicDefaultValues = useMemo(() => {
    const defaults: Record<string, any> = {};

    allAttributes?.forEach((attr: any) => {
      switch (attr.ui_component) {
        case 'multivalue':
          defaults[attr.handle] = [];
          defaults[`${attr.handle}UseForVariants`] = false;
          break;
        case 'select':
        case 'text':
        case 'unit':
        case 'text_area':
        case 'toggle':
          defaults[attr.handle] = undefined;
          break;
      }
    });

    stock_locations?.forEach((location: any) => {
      defaults[`stock_locations.${location.id}`] = {
        id: undefined,
        quantity: '',
        checked: false,
        disabledToggle: false
      };
    });

    return defaults;
  }, [allAttributes, stock_locations]);

  const form = useExtendableForm({
    defaultValues: {
      ...PRODUCT_CREATE_FORM_DEFAULTS,
      ...dynamicDefaultValues,
      sales_channels: defaultChannel
        ? [
            {
              id: defaultChannel.id,
              name: defaultChannel.name
            }
          ]
        : []
    },
    schema: extendedSchema,
    configs,
    mode: 'onBlur'
  });

  const { mutateAsync, isPending } = useCreateProduct();

  // Create a function to get the batch mutation for a specific inventory item
  const getBatchMutation = (inventoryItemId: string) => {
    return useBatchInventoryItemLocationLevels(inventoryItemId);
  };

  // Ref for attributes form validation
  const attributesFormRef = useRef<ProductCreateAttributesFormRef>(null);

  /**
   * TODO: Important to revisit this - use variants watch so high in the tree can cause needless rerenders of the entire page
   * which is suboptimal when rerenders are caused by bulk editor changes
   */

  const watchedVariants = useWatch({
    control: form.control,
    name: 'variants'
  });

  const showInventoryTab = useMemo(
    () => watchedVariants.some((v: any) => v.manage_inventory && v.inventory_kit),
    [watchedVariants]
  );

  const handleSubmit = form.handleSubmit(async (values, e) => {
    let isDraftSubmission = false;

    if (e?.nativeEvent instanceof SubmitEvent) {
      const submitter = e?.nativeEvent?.submitter as HTMLButtonElement;
      isDraftSubmission = submitter.dataset.name === SAVE_DRAFT_BUTTON;
    }

    const media = values.media || [];
    const { secondary_categories, ...rest } = values;

    const additionalDataValues: Array<{ attribute_id: string; value: any }> = [];

    // Get all form field names to identify dynamic attributes
    const allFieldNames = Object.keys(values);

    let dynamicAttributeFields: string[] = [];

    if (allAttributes && allAttributes.length > 0) {
      dynamicAttributeFields = allAttributes.map((attr: any) => attr.handle);
    } else {
      // Fallback: use the old logic if we can't get attributes from API
      const knownFields = [
        'title',
        'subtitle',
        'handle',
        'description',
        'discountable',
        'type_id',
        'collection_id',
        'shipping_profile_id',
        'categories',
        'secondary_categories',
        'tags',
        'sales_channels',
        'origin_country',
        'material',
        'width',
        'length',
        'height',
        'weight',
        'mid_code',
        'hs_code',
        'options',
        'enable_variants',
        'variants',
        'media',
        'regionsCurrencyMap',
        'status',
        'additional_data'
      ];

      // Find dynamic attribute fields (those not in known fields)
      dynamicAttributeFields = allFieldNames.filter(
        fieldName => !knownFields.includes(fieldName) && !fieldName.endsWith('UseForVariants') // Exclude "Use for Variants" fields
      );
    }

    // Get user-created options (with metadata === 'user-created')
    // Use values.options instead of finalPayload.options since finalPayload is defined later
    const userCreatedOptions =
      (rest as any).options?.filter(
        (opt: any) => opt.metadata === 'user-created' && opt.title && opt.values?.length > 0
      ) || [];

    // Generate options from required multivalue attributes with "Use for Variants" enabled
    const variantAttributes: Array<{
      handle: string;
      name: string;
      attributeId: string;
      selectedValues: Array<{ id: string; value: string }>;
    }> = [];

    allAttributes?.forEach((attr: any) => {
      if (attr.ui_component === 'multivalue') {
        const useForVariantsField = `${attr.handle}UseForVariants`;
        const isUsedForVariants = form.getValues(useForVariantsField as any);
        const selectedValueIds = form.getValues(attr.handle as any);

        if (
          isUsedForVariants &&
          selectedValueIds &&
          Array.isArray(selectedValueIds) &&
          selectedValueIds.length > 0
        ) {
          const selectedValues = selectedValueIds
            .map((valueId: string) => {
              const possibleValue = (attr as any).possible_values?.find(
                (pv: any) => pv.id === valueId
              );
              return possibleValue ? { id: valueId, value: possibleValue.value } : null;
            })
            .filter((item): item is { id: string; value: string } => item !== null);

          if (selectedValues.length > 0) {
            variantAttributes.push({
              handle: attr.handle,
              name: attr.name,
              attributeId: attr.id,
              selectedValues
            });
          }
        }
      }
    });

    // Generate options from required multivalue attributes
    const requiredAttributeOptions = variantAttributes.map(attr => ({
      title: attr.name,
      values: attr.selectedValues.map(v => v.value),
      metadata: 'required-attribute'
    }));

    // Combine user-created options and required attribute options
    const allOptions = [...userCreatedOptions, ...requiredAttributeOptions];

    dynamicAttributeFields.forEach(fieldName => {
      const value = form.getValues(fieldName as any);

      if (value === undefined || value === null || value === '') {
        return;
      }

      const attribute = allAttributes?.find((attr: any) => attr.handle === fieldName);
      if (!attribute) {
        return;
      }

      if (Array.isArray(value) && value.length > 0) {
        value.forEach((valueId: string) => {
          const possibleValue = (attribute as any).possible_values?.find(
            (pv: any) => pv.id === valueId
          );
          const actualValue = possibleValue ? possibleValue.value : valueId;
          additionalDataValues.push({
            attribute_id: attribute.id,
            value: String(actualValue)
          });
        });
      }
      // For single values, convert value ID to actual value
      else if (!Array.isArray(value)) {
        let actualValue = value;

        // If it's a select/multiselect value, convert ID to actual value
        if ((attribute as any).possible_values && typeof value === 'string') {
          const possibleValue = (attribute as any).possible_values.find(
            (pv: any) => pv.id === value
          );
          if (possibleValue) {
            actualValue = possibleValue.value;
          }
        }

        additionalDataValues.push({
          attribute_id: attribute.id,
          value: String(actualValue)
        });
      }
    });

    // Remove dynamic attribute fields from payload
    const { ...payload } = rest;
    dynamicAttributeFields.forEach(fieldName => {
      delete payload[fieldName as keyof typeof payload];
    });

    // Also remove "Use for Variants" fields
    const useForVariantsFields = allFieldNames.filter(fieldName =>
      fieldName.endsWith('UseForVariants')
    );
    useForVariantsFields.forEach(fieldName => {
      delete payload[fieldName as keyof typeof payload];
    });

    // Remove dynamic stock location fields
    const stockLocationFields = allFieldNames.filter(fieldName =>
      fieldName.startsWith('stock_locations.')
    );
    stockLocationFields.forEach(fieldName => {
      delete payload[fieldName as keyof typeof payload];
    });

    const finalPayload = { ...payload, media: undefined };

    let uploadedMedia: (HttpTypes.AdminFile & {
      isThumbnail: boolean;
    })[] = [];
    try {
      if (media.length) {
        const thumbnailReq = media.filter((m: any) => m.isThumbnail);
        const otherMediaReq = media.filter((m: any) => !m.isThumbnail);

        const fileReqs = [];
        if (thumbnailReq?.length) {
          fileReqs.push(
            uploadFilesQuery(thumbnailReq).then((r: any) =>
              r.files.map((f: any) => ({
                ...f,
                isThumbnail: true
              }))
            )
          );
        }
        if (otherMediaReq?.length) {
          fileReqs.push(
            uploadFilesQuery(otherMediaReq).then((r: any) =>
              r.files.map((f: any) => ({
                ...f,
                isThumbnail: false
              }))
            )
          );
        }

        uploadedMedia = (await Promise.all(fileReqs)).flat();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }

    const mappedVariants = (finalPayload as any).variants.map((variant: any) => {
      const mappedOptions: Record<string, string> = {};

      // Map options from all options (user-created + required attributes)
      allOptions.forEach(option => {
        // Extract the value for this option from the variant title
        const variantTitle = variant.title || '';
        const optionValues = option.values || [];

        // Find which value this variant has for this option
        const matchingValue = optionValues.find((value: string) => variantTitle.includes(value));

        if (matchingValue) {
          mappedOptions[option.title] = matchingValue;
        }
      });

      // Exclude media and stock_locations fields from API request
      const { media, stock_locations, ...variantWithoutMedia } = variant;

      return {
        ...variantWithoutMedia,
        options: mappedOptions
      };
    });

    const finalPayloadWithAdditionalData = {
      ...finalPayload,
      status: isDraftSubmission ? 'draft' : 'proposed',
      images: uploadedMedia,
      weight: parseInt((finalPayload as any).weight || '') || undefined,
      length: parseInt((finalPayload as any).length || '') || undefined,
      height: parseInt((finalPayload as any).height || '') || undefined,
      width: parseInt((finalPayload as any).width || '') || undefined,
      type_id: (finalPayload as any).type_id || undefined,
      tags:
        (finalPayload as any).tags?.map((tag: any) => ({
          id: tag
        })) || [],
      collection_id: (finalPayload as any).collection_id || undefined,
      shipping_profile_id: undefined,
      enable_variants: undefined,
      // Combine user-created options and required attribute options
      // If no options exist, use default from payload
      options: allOptions.length > 0 ? allOptions : (finalPayload as any).options,
      additional_data:
        additionalDataValues.length > 0
          ? {
              values: additionalDataValues
            }
          : undefined
    };

    // PAYLOAD INSPECTION MODE - Log payload to console instead of making request
    // To restore normal API call: remove console.log lines and uncomment mutateAsync below
    const payloadToSend = {
      ...finalPayloadWithAdditionalData,
      categories: (finalPayload as any).categories.map((cat: any) => ({
        id: cat
      })),
      variants: mappedVariants.map((variant: any) => {
        // TODO: update when api is ready
        // Exclude media and stock_locations fields from final API request
        const { media, stock_locations, ...variantWithoutMedia } = variant;

        return {
          ...variantWithoutMedia,
          sku: variant.sku === '' ? undefined : variant.sku,
          manage_inventory: true,
          allow_backorder: false,
          should_create: undefined,
          is_default: undefined,
          inventory_kit: undefined,
          inventory: undefined,
          prices: Object.keys(variant.prices || {}).map(key => ({
            currency_code: key,
            amount: parseFloat(variant.prices?.[key] as string)
          }))
        };
      })
    };

    console.log('=== PRODUCT CREATE PAYLOAD ===');
    console.log(payloadToSend);
    console.log('=== END PAYLOAD ===');
    return; // Stop execution here when inspecting payload

    // NORMAL MODE - Uncomment below and remove console.log + return above to restore API call
    // const productData = await mutateAsync(
    //   {
    //     ...finalPayloadWithAdditionalData,
    //     categories: (finalPayload as any).categories.map((cat: any) => ({
    //       id: cat
    //     })),
    //     variants: mappedVariants.map((variant: any) => {
    //       // TODO: update when api is ready
    //       // Exclude media and stock_locations fields from final API request
    //       const { media, stock_locations, ...variantWithoutMedia } = variant;

    //       return {
    //         ...variantWithoutMedia,
    //         sku: variant.sku === '' ? undefined : variant.sku,
    //         manage_inventory: true,
    //         allow_backorder: false,
    //         should_create: undefined,
    //         is_default: undefined,
    //         inventory_kit: undefined,
    //         inventory: undefined,
    //         prices: Object.keys(variant.prices || {}).map(key => ({
    //           currency_code: key,
    //           amount: parseFloat(variant.prices?.[key] as string)
    //         }))
    //       };
    //     })
    //   },
    //   {
    //     onError: error => {
    //       toast.error(error.message);
    //     }
    //   }
    // );

    // NORMAL MODE - Code below runs after successful API call
    // (Currently unreachable due to return above - will work when mutateAsync is uncommented)
    // if (productData?.product?.variants && stock_locations.length > 0) {
    //   try {
    //     for (const variant of productData.product.variants) {
    //       if (variant.inventory_items && variant.inventory_items.length > 0) {
    //         const inventoryItemId = variant.inventory_items[0].id;
    //         // Get stock location data for this variant from the form
    //         const variantIndex = mappedVariants.findIndex((v: any) => v.title === variant.title);
    //         const variantStockLocations = mappedVariants[variantIndex]?.stock_locations;

    //         if (variantStockLocations) {
    //           const batchPayload: any = {
    //             create: [],
    //             update: [],
    //             delete: [],
    //             force: true
    //           };

    //           // Process each stock location for this variant
    //           Object.entries(variantStockLocations).forEach(
    //             ([locationId, locationData]: [string, any]) => {
    //               if (
    //                 locationData.checked &&
    //                 locationData.quantity !== '' &&
    //                 locationData.quantity !== 0
    //               ) {
    //                 batchPayload.create.push({
    //                   location_id: locationId,
    //                   stocked_quantity: parseFloat(locationData.quantity) || 0
    //                 });
    //               }
    //             }
    //           );

    //           // Only make the API call if there are locations to create
    //           if (batchPayload.create.length > 0) {
    //             const batchMutation = getBatchMutation(inventoryItemId);
    //             await batchMutation.mutateAsync(batchPayload);
    //           }
    //         }
    //       }
    //     }
    //   } catch (error) {
    //     console.error('Error assigning stock locations:', error);
    //     // Don't fail the entire product creation for stock location errors
    //     toast.error(
    //       'Product created successfully, but there was an issue assigning stock locations.'
    //     );
    //   }
    // }

    // toast.success(
    //   t('products.create.successToast', {
    //     title: productData.product.title
    //   })
    // );

    // handleSuccess(`../${productData.product.id}`);
  });

  const onNext = async (currentTab: Tab) => {
    // Validate current tab before proceeding
    let fieldsToValidate: (keyof ProductCreateSchemaType)[] = [];
    let shouldProceed = true;

    switch (currentTab) {
      case Tab.DETAILS:
        fieldsToValidate = ['title'];
        break;
      case Tab.ORGANIZE:
        fieldsToValidate = ['categories'];
        break;
      case Tab.ATTRIBUTES:
        // For attributes tab, use custom validation function
        if (attributesFormRef.current) {
          shouldProceed = await attributesFormRef.current.validateAttributes();
        }
        break;
      case Tab.VARIANTS:
        fieldsToValidate = ['variants', 'options'];
        break;
      case Tab.INVENTORY:
        // No validation needed for inventory tab
        break;
    }

    // Validate standard form fields if needed
    if (fieldsToValidate.length > 0) {
      const valid = await form.trigger(fieldsToValidate);
      if (!valid) {
        return;
      }
    }

    // Only proceed if validation passed
    if (!shouldProceed) {
      return;
    }

    // Determine next tab
    let nextTab: Tab;
    if (currentTab === Tab.DETAILS) {
      nextTab = Tab.ORGANIZE;
    } else if (currentTab === Tab.ORGANIZE) {
      nextTab = Tab.ATTRIBUTES;
    } else if (currentTab === Tab.ATTRIBUTES) {
      nextTab = Tab.VARIANTS;
    } else if (currentTab === Tab.VARIANTS) {
      nextTab = Tab.INVENTORY;
    } else {
      return; // Already at last tab
    }

    // Update maxReachedTab to the current tab since we've successfully validated it
    // maxReachedTab represents the last completed tab, not the next one
    const currentTabIndex = TAB_ORDER.indexOf(currentTab);
    const currentMaxIndex = TAB_ORDER.indexOf(maxReachedTab);
    if (currentTabIndex >= currentMaxIndex) {
      setMaxReachedTab(currentTab);
    }

    // Navigate to next tab
    setTab(nextTab);
  };

  useEffect(() => {
    const currentIndex = TAB_ORDER.indexOf(tab);
    const maxReachedIndex = TAB_ORDER.indexOf(maxReachedTab);

    const currentState: TabState = {
      [Tab.DETAILS]: 'not-started',
      [Tab.ORGANIZE]: 'not-started',
      [Tab.ATTRIBUTES]: 'not-started',
      [Tab.VARIANTS]: 'not-started',
      [Tab.INVENTORY]: 'not-started'
    };

    // Set status for each tab
    TAB_ORDER.forEach((tabItem, index) => {
      if (index < currentIndex && index <= maxReachedIndex) {
        // Tabs before current that have been reached (validated) are completed
        currentState[tabItem] = 'completed';
      } else if (index === currentIndex) {
        // Current tab is in-progress
        currentState[tabItem] = 'in-progress';
      } else if (index > currentIndex && index <= maxReachedIndex) {
        // Tabs after current but within maxReachedTab are completed (preserved when going back)
        currentState[tabItem] = 'completed';
      } else {
        // Tabs beyond maxReachedTab are not-started
        currentState[tabItem] = 'not-started';
      }
    });

    setTabState(currentState);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want this effect to run when the tab or maxReachedTab changes
  }, [tab, maxReachedTab]);

  return (
    <>
      <RouteFocusModal.Form form={form}>
        <KeyboundForm
          onKeyDown={e => {
            // We want to continue to the next tab on enter instead of saving as draft immediately
            if (e.key === 'Enter') {
              if (e.target instanceof HTMLTextAreaElement && !(e.metaKey || e.ctrlKey)) {
                return;
              }

              e.preventDefault();

              if (e.metaKey || e.ctrlKey) {
                if (tab !== Tab.VARIANTS) {
                  e.preventDefault();
                  e.stopPropagation();
                  onNext(tab);

                  return;
                }

                handleSubmit();
              }
            }
          }}
          onSubmit={handleSubmit}
          className="flex h-full flex-col"
        >
          <ProgressTabs
            value={tab}
            onValueChange={async newTab => {
              const newTabValue = newTab as Tab;
              const currentIndex = TAB_ORDER.indexOf(tab);
              const newIndex = TAB_ORDER.indexOf(newTabValue);
              const maxReachedIndex = TAB_ORDER.indexOf(maxReachedTab);

              // Only validate when moving forward, not backward
              const movingForward = isMovingForward(tab, newTabValue);

              if (movingForward) {
                // Check if we're trying to skip tabs - if newTab is beyond maxReachedTab + 1, block it
                if (newIndex > maxReachedIndex + 1) {
                  // Can't skip tabs - must complete them sequentially
                  return;
                }

                // If moving to a tab that's not the immediate next one, we need to validate all tabs in between
                // But since we can only move to maxReachedTab + 1, we only need to validate current tab
                let fieldsToValidate: (keyof ProductCreateSchemaType)[] = [];

                switch (tab) {
                  case Tab.DETAILS:
                    fieldsToValidate = ['title'];
                    break;
                  case Tab.ORGANIZE:
                    fieldsToValidate = ['categories'];
                    break;
                  case Tab.ATTRIBUTES:
                    fieldsToValidate = [];
                    break;
                  case Tab.VARIANTS:
                    fieldsToValidate = ['variants', 'options'];
                    break;
                  case Tab.INVENTORY:
                    break;
                }

                if (fieldsToValidate.length > 0) {
                  const valid = await form.trigger(fieldsToValidate);
                  if (!valid) {
                    return;
                  }
                } else if (tab === Tab.ATTRIBUTES) {
                  if (attributesFormRef.current) {
                    const valid = await attributesFormRef.current.validateAttributes();
                    if (!valid) {
                      return;
                    }
                  }
                }

                // Update maxReachedTab to the current tab since we've successfully validated it
                // maxReachedTab represents the last completed tab, not the next one
                if (currentIndex >= maxReachedIndex) {
                  setMaxReachedTab(tab);
                }
              }

              // Allow navigation (forward or backward) if validation passed or moving backward
              setTab(newTabValue);
            }}
            className="flex h-full flex-col overflow-hidden"
          >
            <RouteFocusModal.Header>
              <div className="-my-2 w-full border-l">
                <ProgressTabs.List className="justify-start-start flex w-full items-center">
                  <ProgressTabs.Trigger
                    status={tabState[Tab.DETAILS]}
                    value={Tab.DETAILS}
                    className="max-w-[200px] truncate"
                  >
                    {t('products.create.tabs.details')}
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    status={tabState[Tab.ORGANIZE]}
                    value={Tab.ORGANIZE}
                    className="max-w-[200px] truncate"
                  >
                    {t('products.create.tabs.organize')}
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    status={tabState[Tab.ATTRIBUTES]}
                    value={Tab.ATTRIBUTES}
                    className="max-w-[200px] truncate"
                  >
                    {t('products.create.tabs.attributes')}
                  </ProgressTabs.Trigger>
                  <ProgressTabs.Trigger
                    status={tabState[Tab.VARIANTS]}
                    value={Tab.VARIANTS}
                    className="max-w-[200px] truncate"
                  >
                    {t('products.create.tabs.variants')}
                  </ProgressTabs.Trigger>
                  {showInventoryTab && (
                    <ProgressTabs.Trigger
                      status={tabState[Tab.INVENTORY]}
                      value={Tab.INVENTORY}
                      className="max-w-[200px] truncate"
                    >
                      {t('products.create.tabs.inventory')}
                    </ProgressTabs.Trigger>
                  )}
                </ProgressTabs.List>
              </div>
            </RouteFocusModal.Header>
            <RouteFocusModal.Body className="size-full overflow-hidden">
              <ProgressTabs.Content
                className="size-full overflow-y-auto"
                value={Tab.DETAILS}
              >
                <ProductCreateDetailsForm form={form as any} />
              </ProgressTabs.Content>
              <ProgressTabs.Content
                className="size-full overflow-y-auto"
                value={Tab.ORGANIZE}
              >
                <ProductCreateOrganizeForm form={form as any} />
              </ProgressTabs.Content>
              <ProgressTabs.Content
                className="size-full overflow-y-auto"
                value={Tab.ATTRIBUTES}
              >
                <ProductCreateAttributesForm
                  form={form as any}
                  ref={attributesFormRef}
                />
              </ProgressTabs.Content>
              <ProgressTabs.Content
                className="size-full overflow-y-auto"
                value={Tab.VARIANTS}
              >
                <ProductCreateVariantsForm
                  form={form as any}
                  store={store}
                  regions={regions}
                  pricePreferences={pricePreferences}
                  onOpenMediaModal={onOpenMediaModal}
                />
              </ProgressTabs.Content>
              {showInventoryTab && (
                <ProgressTabs.Content
                  className="size-full overflow-y-auto"
                  value={Tab.INVENTORY}
                >
                  <ProductCreateInventoryKitForm form={form as any} />
                </ProgressTabs.Content>
              )}
            </RouteFocusModal.Body>
          </ProgressTabs>
          <RouteFocusModal.Footer>
            <div className="flex items-center justify-end gap-x-2">
              <RouteFocusModal.Close asChild>
                <Button
                  variant="secondary"
                  size="small"
                >
                  {t('actions.cancel')}
                </Button>
              </RouteFocusModal.Close>
              <Button
                data-name={SAVE_DRAFT_BUTTON}
                size="small"
                type="submit"
                isLoading={isPending}
                className="whitespace-nowrap"
              >
                Draft
              </Button>
              <PrimaryButton
                tab={tab}
                next={onNext}
                isLoading={isPending}
                showInventoryTab={showInventoryTab}
              />
            </div>
          </RouteFocusModal.Footer>
        </KeyboundForm>
      </RouteFocusModal.Form>
    </>
  );
};

type PrimaryButtonProps = {
  tab: Tab;
  next: (tab: Tab) => void;
  isLoading?: boolean;
  showInventoryTab: boolean;
};

const PrimaryButton = ({ tab, next, isLoading, showInventoryTab }: PrimaryButtonProps) => {
  const { t } = useTranslation();

  if ((tab === Tab.VARIANTS && !showInventoryTab) || (tab === Tab.INVENTORY && showInventoryTab)) {
    return (
      <Button
        data-name="publish-button"
        key="submit-button"
        type="submit"
        variant="primary"
        size="small"
        isLoading={isLoading}
      >
        Create Product
      </Button>
    );
  }

  return (
    <Button
      key="next-button"
      type="button"
      variant="primary"
      size="small"
      onClick={() => next(tab)}
    >
      {t('actions.continue')}
    </Button>
  );
};
