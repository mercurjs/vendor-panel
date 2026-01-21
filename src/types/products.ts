import { HttpTypes } from '@medusajs/types';

export interface ProductOptionMetadata {
  author?: string;
  [key: string]: unknown;
}

export type ExtendedAdminProductOption = Omit<HttpTypes.AdminProductOption, 'metadata'> & {
  metadata?: ProductOptionMetadata | null;
};

export type ExtendedAdminProduct = Omit<HttpTypes.AdminProduct, 'variants' | 'options'> & {
  thumbnail: string;
  images: Array<HttpTypes.AdminProductImage & { url: string }>;
  attribute_values?: ExtendedAdminProductAttributeValues[];
  variants?: ExtendedAdminProductVariant[];
  shipping_profile: HttpTypes.AdminShippingProfile;
  informational_attributes?: ProductInformationalAttribute[];
  options?: ExtendedAdminProductOption[];
};

export type ExtendedAdminProductAttributValuesAttribute = {
  id: string;
  name: string;
  description: string | null;
  is_required: boolean;
  is_filterable: boolean;
  handle: string;
  metadata: Record<string, unknown>;
  ui_component: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ExtendedAdminProductAttributeValues = {
  id: string;
  value: string;
  rank: number;
  metadata: Record<string, unknown> | null;
  attribute_id: string;
  attribute: ExtendedAdminProductAttributValuesAttribute;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export interface ProductInformationalAttribute {
  attribute_id: string;
  description?: string | null;
  is_filterable: boolean;
  is_required?: boolean;
  /**
   * Backend field name (current): attribute_source
   * Values are guaranteed to be either vendor/admin.
   */
  attribute_source: 'vendor' | 'admin';
  /**
   * Legacy field name (older backend): source
   */
  source?: 'vendor' | 'admin';
  /**
   * Whether the attribute definition (not values) can be edited.
   */
  is_definition_editable?: boolean;
  name: string;
  ui_component: string;
  values: ProductInformationalAttributeValue[];
  metadata?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProductInformationalAttributeValue {
  value: string;
  source: 'vendor' | 'admin';
  attribute_value_id: string;
  is_filterable: boolean;
  is_editable: boolean;
}

export type ExtendedAdminProductResponse = Omit<HttpTypes.AdminProductResponse, 'product'> & {
  product: ExtendedAdminProduct;
};

export type ExtendedAdminProductListResponse = Omit<
  HttpTypes.AdminProductListResponse,
  'products'
> & {
  products: ExtendedAdminProduct[];
};

export type ExtendedAdminPrice = HttpTypes.AdminPrice & {
  rules?: {
    region_id?: string;
    [key: string]: unknown;
  };
};

export type ExtendedAdminProductVariantInventoryItemLink =
  HttpTypes.AdminProductVariantInventoryItemLink & {
    required_quantity: number;
  };

export type ExtendedAdminProductVariant = Omit<
  HttpTypes.AdminProductVariant,
  'prices' | 'inventory_items'
> & {
  prices?: ExtendedAdminPrice[] | null;
  inventory_items?: ExtendedAdminProductVariantInventoryItemLink[] | null;
  inventory?: HttpTypes.AdminInventoryItem[] | null;
};

export type ExtendedAdminProductWithVariants = Omit<ExtendedAdminProduct, 'variants'> & {
  variants?: ExtendedAdminProductVariant[];
};

/**
 * Union type for product stock grid rows
 * Can be either a variant (parent row) or an inventory item link (child row)
 */
export type ProductStockGridRow =
  | ExtendedAdminProductVariant
  | HttpTypes.AdminProductVariantInventoryItemLink;

export interface ProductAttributePossibleValue {
  id: string;
  value: string;
  rank: number;
  metadata: Record<string, any>;
  attribute_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProductAttributeCategory {
  id: string;
  name: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  description: string;
  handle: string;
  is_filterable: boolean;
  ui_component: 'toggle' | 'select' | 'text' | 'text_area' | 'unit';
  metadata: Record<string, any>;
  possible_values: ProductAttributePossibleValue[];
  product_categories: ProductAttributeCategory[];
}

export interface ProductAttributesResponse {
  attributes: ProductAttribute[];
}

export interface AdminProductWithAttributes extends HttpTypes.AdminProduct {
  attribute_values?: {
    attribute_id: string;
    value: string;
  }[];
}
