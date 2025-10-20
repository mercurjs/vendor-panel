import { useState } from "react";

import { CurrencyDollar } from "@medusajs/icons";
import type { HttpTypes } from "@medusajs/types";
import { Button, Container, Heading } from "@medusajs/ui";

import { useTranslation } from "react-i18next";

import { ActionMenu } from "@components/common/action-menu";
import { NoRecords } from "@components/common/empty-table-content";

import isB2B from "@lib/is-b2b";
import { getLocaleAmount } from "@lib/money-amount-helpers";

type VariantPricesSectionProps = {
  variant: HttpTypes.AdminProductVariant;
};

export function VariantPricesSection({ variant }: VariantPricesSectionProps) {
  const { t } = useTranslation();
  const prices = variant.prices
    ?.filter((p) => !Object.keys(p.rules || {}).length)
    .sort((p1, p2) => p1.currency_code?.localeCompare(p2.currency_code));

  const hasPrices = !!prices?.length;
  const [pageSize, setPageSize] = useState(3);
  const displayPrices = prices?.slice(0, pageSize);

  const onShowMore = () => {
    setPageSize(pageSize + 3);
  };

  const isB2BPanel = isB2B();

  return (
    <Container className="flex flex-col divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("labels.prices")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("actions.edit"),
                  to: isB2BPanel
                    ? `/offers/${variant.product_id}/variants/${variant.id}/prices`
                    : `/products/${variant.product_id}/variants/${variant.id}/prices`,
                  icon: <CurrencyDollar />,
                },
              ],
            },
          ]}
        />
      </div>
      {!hasPrices && <NoRecords className="h-60" />}
      {displayPrices?.map((price) => {
        return (
          <div
            key={price.id}
            className="txt-small flex justify-between px-6 py-4 text-ui-fg-subtle"
          >
            <span className="font-medium">
              {price.currency_code.toUpperCase()}
            </span>
            <span>{getLocaleAmount(price.amount, price.currency_code)}</span>
          </div>
        );
      })}
      {hasPrices && (
        <div className="txt-small flex items-center justify-between px-6 py-4 text-ui-fg-subtle">
          <span className="font-medium">
            {t("products.variant.pricesPagination", {
              total: prices.length,
              current: Math.min(pageSize, prices.length),
            })}
          </span>
          <Button
            onClick={onShowMore}
            disabled={pageSize >= prices.length}
            className="-mr-3 text-blue-500"
            variant="transparent"
          >
            {t("actions.showMore")}
          </Button>
        </div>
      )}
    </Container>
  );
}
