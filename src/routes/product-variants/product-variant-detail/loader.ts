import { LoaderFunctionArgs } from 'react-router-dom';

import { variantsQueryKeys } from '../../../hooks/api/products';
import { fetchQuery } from '../../../lib/client';
import { queryClient } from '../../../lib/query-client';
import { PRODUCT_VARIANT_DETAIL_FIELDS, VARIANT_DETAIL_FIELDS } from './constants';

const variantDetailQuery = (productId: string, variantId: string) => ({
  queryKey: variantsQueryKeys.detail(variantId, {
    fields: VARIANT_DETAIL_FIELDS
  }),
  queryFn: async () => {
    const { product } = await fetchQuery(`/vendor/products/${productId}`, {
      method: 'GET',
      query: {
        fields: PRODUCT_VARIANT_DETAIL_FIELDS
      }
    });

    const variant = product.variants.find(({ id }: { id: string }) => id === variantId);

    return { variant };
  }
});

export const variantLoader = async ({ params }: LoaderFunctionArgs) => {
  const productId = params.id;
  const variantId = params.variant_id;

  const query = variantDetailQuery(productId!, variantId!);

  return queryClient.ensureQueryData(query);
};
