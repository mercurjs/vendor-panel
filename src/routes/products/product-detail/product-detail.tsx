import { useParams } from "react-router-dom";

import { TwoColumnPageSkeleton } from "@components/common/skeleton";
import { TwoColumnPage } from "@components/layout/pages";

import { useDashboardExtension } from "@extensions/dashboard-extension-provider";

import { useProduct } from "@hooks/api/products";

import isB2B from "@lib/is-b2b";

import { ProductOrganizationSection as ProductOrganizationSectionB2B } from "@routes/products/product-detail/components/B2B/product-organization-section";
import { ProductOrganizationSection as ProductOrganizationSectionB2C } from "@routes/products/product-detail/components/B2C/product-organization-section";
import { ProductAdditionalAttributesSection } from "@routes/products/product-detail/components/product-additional-attribute-section/ProductAdditionalAttributesSection";
import { ProductGeneralSection } from "@routes/products/product-detail/components/product-general-section";
import { ProductMediaSection } from "@routes/products/product-detail/components/product-media-section";
import { ProductOptionSection } from "@routes/products/product-detail/components/product-option-section";
import { ProductVariantSection } from "@routes/products/product-detail/components/product-variant-section";

export const ProductDetail = () => {
  const { id } = useParams();
  const { product, isLoading, isError, error } = useProduct(id!, {
    fields:
      "*variants.inventory_items,*categories,attribute_values.*,attribute_values.attribute.*",
  });

  const { getWidgets } = useDashboardExtension();

  const after = getWidgets("product.details.after");
  const before = getWidgets("product.details.before");
  const sideAfter = getWidgets("product.details.side.after");
  const sideBefore = getWidgets("product.details.side.before");

  if (isLoading || !product) {
    return <TwoColumnPageSkeleton mainSections={4} sidebarSections={3} />;
  }

  if (isError) {
    throw error;
  }

  const isB2BPanel = isB2B();

  return (
    <TwoColumnPage
      widgets={{
        after,
        before,
        sideAfter,
        sideBefore,
      }}
      data={product}
    >
      <TwoColumnPage.Main>
        <ProductGeneralSection product={product} />
        <ProductMediaSection product={product} />
        {!isB2BPanel && <ProductOptionSection product={product} />}
        <ProductVariantSection product={product} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        {/* <ProductShippingProfileSection product={product} /> */}
        {isB2BPanel ? (
          <ProductOrganizationSectionB2B product={product} />
        ) : (
          <ProductOrganizationSectionB2C product={product} />
        )}
        {/* <ProductAttributeSection product={product} /> */}
        <ProductAdditionalAttributesSection product={product} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
