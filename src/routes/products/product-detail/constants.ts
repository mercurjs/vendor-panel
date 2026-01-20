import { getLinkedFields } from '../../../extensions';

const BASE_PRODUCT_DETAIL_FIELDS = [
  '*variants.inventory_items',
  '*variants.images',
  '*categories',
  'attribute_values.*',
  'attribute_values.attribute.*',
  'options.*',
  'options.values.*'
].join(',');

export const PRODUCT_DETAIL_FIELDS = getLinkedFields('product', BASE_PRODUCT_DETAIL_FIELDS);
