import { Heading } from "@medusajs/ui";

import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { RouteDrawer } from "@components/modals";

import { useProduct } from "@hooks/api/products";

import isB2B from "@lib/is-b2b";

import { ProductOrganizationForm as ProductOrganizationFormB2B } from "@routes/products/product-organization/components/B2B/product-organization-form";
import { ProductOrganizationForm as ProductOrganizationFormB2C } from "@routes/products/product-organization/components/B2C/product-organization-form";

export const ProductOrganization = () => {
  const { id } = useParams();
  const { t } = useTranslation();

  const isB2BPanel = isB2B();

  const { product, isLoading, isError, error } = useProduct(id!, {
    fields: isB2BPanel ? "*categories,*secondary_categories" : "*categories",
  });

  if (isError) {
    throw error;
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <RouteDrawer.Title asChild>
          <Heading>{t("products.organization.edit.header")}</Heading>
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      {!isLoading &&
        product &&
        (isB2BPanel ? (
          <ProductOrganizationFormB2B product={product} />
        ) : (
          <ProductOrganizationFormB2C product={product} />
        ))}
    </RouteDrawer>
  );
};
