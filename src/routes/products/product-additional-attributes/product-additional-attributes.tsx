"use client"

import { useParams } from "react-router-dom"
import { Heading } from "@medusajs/ui";
import { Spinner } from "@medusajs/icons";
import { useProduct, useProductAttributes } from "../../../hooks/api";
import { RouteDrawer } from "../../../components/modals";
import { ProductAdditionalAttributesForm } from "./components/product-additional-attributes-form";


export const ProductAdditionalAttributes = () => {
  const { id } = useParams()
  const { product, isLoading: isProductLoading } = useProduct(id!)

  const { attributes, isLoading: isAttributesLoading } = useProductAttributes(
    id!,
  )

  const isReady = !isAttributesLoading && attributes && !isProductLoading && product

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading level="h2">Edit Additional Attributes</Heading>
      </RouteDrawer.Header>
      {isReady ? (
        <ProductAdditionalAttributesForm product={product} attributes={attributes} id={id!} />
      ) : (
        <Spinner className="text-ui-fg-interactive animate-spin" />
      )}
    </RouteDrawer>
  );
};
