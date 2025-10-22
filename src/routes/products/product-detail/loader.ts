import type { LoaderFunctionArgs } from "react-router-dom";

import { productsQueryKeys } from "@hooks/api/products";

import { fetchQuery } from "@lib/client";
import isB2B from "@lib/is-b2b";
import { queryClient } from "@lib/query-client";

import { PRODUCT_DETAIL_FIELDS } from "@routes/products/product-detail/constants";

const isB2BPanel = isB2B();

const productDetailQuery = (id: string) => ({
  queryKey: productsQueryKeys.detail(id, {
    fields: PRODUCT_DETAIL_FIELDS,
  }),
  queryFn: async () =>
    fetchQuery(`/vendor/products/${id}`, {
      method: "GET",
      query: {
        fields: isB2BPanel
          ? "*variants.inventory_items,*categories,*secondary_categories,attribute_values.*,attribute_values.attribute.*"
          : "*variants.inventory_items,*categories,attribute_values.*,attribute_values.attribute.*",
      },
    }),
});

export const productLoader = async ({ params }: LoaderFunctionArgs) => {
  const id = params.id;
  const query = productDetailQuery(id!);

  const response = await queryClient.ensureQueryData({
    ...query,
    staleTime: 90000,
  });

  return response;
};
