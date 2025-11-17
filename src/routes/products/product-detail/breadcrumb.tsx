import { UIMatch } from 'react-router-dom';

import { useProduct } from '../../../hooks/api';
import { ExtendedAdminProductResponse } from '../../../types/products';
import { PRODUCT_DETAIL_FIELDS } from './constants';

type ProductDetailBreadcrumbProps = UIMatch<ExtendedAdminProductResponse>;

export const ProductDetailBreadcrumb = (props: ProductDetailBreadcrumbProps) => {
  const { id } = props.params || {};

  const { product } = useProduct(
    id!,
    {
      fields: PRODUCT_DETAIL_FIELDS
    },
    {
      enabled: Boolean(id)
    }
  );

  if (!product) {
    return null;
  }

  return <span>{product?.title}</span>;
};
