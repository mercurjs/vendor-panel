import { getLinkedFields } from '../../../extensions';

const BASE_PRODUCT_DETAIL_FIELDS = [
  // Base fields used directly in the UI
  "id",
  "title",
  "status",
  "handle",
  "description",
  "discountable",
  // Media
  "*images",
  "thumbnail",
  '*variants.inventory_items',
  '*variants.images',
  '*categories',
  '*secondary_categories',
  'additional_data',
  'attribute_values.*',
  'attribute_values.attribute.*',
  'options.*',
  'options.values.*'
].join(',');

export const PRODUCT_DETAIL_FIELDS = getLinkedFields('product', BASE_PRODUCT_DETAIL_FIELDS);
