import { ExtendedPromotionRule, PromotionRuleFormData } from "../../../../../../types/promotion"

export const generateRuleAttributes = (rules?: ExtendedPromotionRule[]): PromotionRuleFormData[] =>
  (rules || []).map((rule): PromotionRuleFormData => {
    // Handle values based on field type
    let values: number | string | string[]
    
    if (rule.field_type === "number") {
      // For number fields take first value as number
      const firstValue = Array.isArray(rule.values) ? rule.values[0]?.value : rule.values
      values = firstValue ? Number(firstValue) : 0
    } else if (rule.operator === "eq") {
      // For 'eq' operator use single value as string
      const firstValue = Array.isArray(rule.values) ? rule.values[0]?.value : rule.values
      values = firstValue ? String(firstValue) : ""
    } else {
      // For other cases
      values = Array.isArray(rule.values) 
        ? rule.values.map((v) => String(v.value || "")).filter(Boolean)
        : []
    }

    return {
      id: rule.id,
      required: rule.required,
      field_type: rule.field_type,
      disguised: rule.disguised,
      attribute: rule.attribute || "",
      operator: rule.operator || "",
      values,
    }
  })
