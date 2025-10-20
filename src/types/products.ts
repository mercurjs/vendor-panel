import type { HttpTypes } from "@medusajs/types";

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
  ui_component: "toggle" | "select" | "text" | "text_area" | "unit";
  metadata: Record<string, any>;
  possible_values: ProductAttributePossibleValue[];
  product_categories: ProductAttributeCategory[];
}

export interface ProductAttributesResponse {
  attributes: ProductAttribute[];
}

export interface SecondaryCategory {
  id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminProductWithAttributes extends HttpTypes.AdminProduct {
  attribute_values?: {
    attribute_id: string;
    value: string;
  }[];
  secondary_categories?: SecondaryCategory[];
}

export interface AdminUpdateProduct extends HttpTypes.AdminUpdateProduct {
  additional_data?: {
    secondary_categories?: {
      product_id: string;
      secondary_categories_ids: string[];
    }[];
  };
}
