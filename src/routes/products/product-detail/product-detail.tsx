import { useParams } from "react-router-dom";

import { TwoColumnPageSkeleton } from "@components/common/skeleton";
import { TwoColumnPage } from "@components/layout/pages";

import { useDashboardExtension } from "@extensions/dashboard-extension-provider";

import { useProduct } from "@hooks/api/products";

import { ProductAdditionalAttributesSection } from "@routes/products/product-detail/components/product-additional-attribute-section/ProductAdditionalAttributesSection";
import { ProductGeneralSection } from "@routes/products/product-detail/components/product-general-section";
import { ProductMediaSection } from "@routes/products/product-detail/components/product-media-section";
import { ProductOptionSection } from "@routes/products/product-detail/components/product-option-section";
import { ProductOrganizationSection } from "@routes/products/product-detail/components/product-organization-section";
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
        <ProductOptionSection product={product} />
        <ProductVariantSection product={product} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        {/* <ProductShippingProfileSection product={product} /> */}
        <ProductOrganizationSection product={product} />
        {/* <ProductAttributeSection product={product} /> */}
        <ProductAdditionalAttributesSection product={product} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  );
};
