import { HttpTypes } from "@medusajs/types"

export interface ExtendedPromotionRuleValue {
  id?: string
  value?: string
  label?: string
}

export interface ExtendedPromotionRule extends Omit<HttpTypes.AdminPromotionRule, 'values'> {
  field_type?: string
  required?: boolean
  disguised?: boolean
  hydrate?: boolean
  attribute_label?: string
  operator_label?: string
  values: ExtendedPromotionRuleValue[]
}

// Alias for consistency
export interface ExtendedPromotionRuleWithValues extends ExtendedPromotionRule {
}

export interface PromotionRuleFormData {
  id?: string
  attribute: string
  operator: string
  values: number | string | string[]
  required?: boolean
  disguised?: boolean
  field_type?: string
}
