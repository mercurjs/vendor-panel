import { useMemo } from "react";

import type { HttpTypes } from "@medusajs/types";
import { Text } from "@medusajs/ui";

import { type UseFormReturn, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import {
  DataGrid,
  createDataGridHelper,
  createDataGridPriceColumns,
} from "@components/data-grid";
import { useRouteModal } from "@components/modals/index";

import { usePricePreferences } from "@hooks/api/price-preferences";
import { useRegions } from "@hooks/api/regions.tsx";
import { useStore } from "@hooks/api/store";

import type { ProductCreateSchemaType } from "@routes/products/product-create/types";

type VariantPricingFormProps = {
  form: UseFormReturn<ProductCreateSchemaType>;
  product: HttpTypes.AdminProduct;
};

export const VariantPricingForm = ({
  form,
  product,
}: VariantPricingFormProps) => {
  const { store } = useStore();
  const { regions } = useRegions({ limit: 9999 });
  const { price_preferences: pricePreferences } = usePricePreferences({});

  const { setCloseOnEscape } = useRouteModal();

  const columns = useVariantPriceGridColumns({
    currencies: store?.supported_currencies,
    regions,
    pricePreferences,
  });

  const variants = useWatch({
    control: form.control,
    name: "variants",
  });

  const dataWithProductInfo = useMemo(() => {
    if (!variants?.length) return [];

    const productInfoRow = {
      id: `product-info-${product.id}`,
      title: product.title,
      isProductInfo: true,
      prices: {},
    };

    return [productInfoRow, ...variants] as (HttpTypes.AdminProductVariant & {
      isProductInfo: boolean;
    })[];
  }, [variants, product.title, product.id]);

  return (
    <DataGrid
      columns={columns}
      data={dataWithProductInfo}
      state={form}
      onEditingChange={(editing) => setCloseOnEscape(!editing)}
    />
  );
};

const columnHelper = createDataGridHelper<
  HttpTypes.AdminProductVariant & { isProductInfo: boolean },
  ProductCreateSchemaType
>();

const useVariantPriceGridColumns = ({
  currencies = [],
  regions = [],
  pricePreferences = [],
}: {
  currencies?: HttpTypes.AdminStore["supported_currencies"];
  regions?: HttpTypes.AdminRegion[];
  pricePreferences?: HttpTypes.AdminPricePreference[];
}) => {
  const { t } = useTranslation();

  return useMemo(() => {
    return [
      columnHelper.column({
        id: t("fields.title"),
        header: t("fields.title"),
        cell: (context) => {
          const entity = context.row.original;
          const isProductInfo = entity.isProductInfo;

          return (
            <DataGrid.ReadonlyCell context={context}>
              <div
                className={`flex h-full w-full items-center gap-x-2 overflow-hidden ${
                  isProductInfo
                    ? "bg-ui-bg-field text-ui-fg-disabled"
                    : "text-ui-fg-subtle"
                }`}
              >
                <Text as="span" className="truncate">
                  {entity.title}
                </Text>
              </div>
            </DataGrid.ReadonlyCell>
          );
        },
        disableHiding: true,
      }),
      ...createDataGridPriceColumns<
        HttpTypes.AdminProductVariant & { isProductInfo: boolean },
        ProductCreateSchemaType
      >({
        currencies: currencies.map((c) => c.currency_code),
        regions,
        pricePreferences,
        isReadyOnly: (context) => context.row.original.isProductInfo,
        getFieldName: (context, value) => {
          const entity = context.row.original;
          if (entity.isProductInfo) return null;

          return `variants.${context.row.index - 1}.prices.${value}`;
        },
        t,
      }),
    ];
  }, [t, currencies, regions, pricePreferences]);
};
