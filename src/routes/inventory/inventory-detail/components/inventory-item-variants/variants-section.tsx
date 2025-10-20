import { TriangleRightMini } from "@medusajs/icons";
import type { ProductVariantDTO } from "@medusajs/types";
import { Container, Heading } from "@medusajs/ui";

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Thumbnail } from "@components/common/thumbnail";

import isB2B from "@lib/is-b2b";

type InventoryItemVariantsSectionProps = {
  variants: ProductVariantDTO[];
};

export const InventoryItemVariantsSection = ({
  variants,
}: InventoryItemVariantsSectionProps) => {
  const { t } = useTranslation();

  if (!variants?.length) {
    return null;
  }

  const isB2BPanel = isB2B();

  return (
    <Container className="p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("inventory.associatedVariants")}</Heading>
      </div>

      <div className="txt-small flex flex-col gap-2 px-2 pb-2">
        {variants.map((variant) => {
          const link = variant.product
            ? `/${isB2BPanel ? "offers" : "products"}/${variant.product.id}/variants/${variant.id}`
            : null;

          const Inner = (
            <div className="rounded-md bg-ui-bg-component px-4 py-2 shadow-elevation-card-rest transition-colors">
              <div className="flex items-center gap-3">
                <div className="rounded-md shadow-elevation-card-rest">
                  <Thumbnail src={variant.product?.thumbnail} />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="font-medium text-ui-fg-base">
                    {variant.title}
                  </span>
                  <span className="text-ui-fg-subtle">
                    {variant.options.map((o) => o.value).join(" ⋅ ")}
                  </span>
                </div>
                <div className="flex size-7 items-center justify-center">
                  <TriangleRightMini className="text-ui-fg-muted" />
                </div>
              </div>
            </div>
          );

          if (!link) {
            return <div key={variant.id}>{Inner}</div>;
          }

          return (
            <Link
              to={link}
              key={variant.id}
              className="rounded-md outline-none focus-within:shadow-borders-interactive-with-focus [&:hover>div]:bg-ui-bg-component-hover"
            >
              {Inner}
            </Link>
          );
        })}
      </div>
    </Container>
  );
};
