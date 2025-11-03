import {
  ExtendedPromotionRule,
  PromotionRuleFormData,
} from "../../../../../../types/promotion"

export const generateRuleAttributes = (
  rules?: ExtendedPromotionRule[]
): PromotionRuleFormData[] =>
  (rules || []).map((rule): PromotionRuleFormData => {
    let values: number | string | string[]
    const firstValue = Array.isArray(rule.values)
      ? rule.values[0]?.value
      : rule.values

    if (rule.field_type === "number") {
      values = firstValue ? Number(firstValue) : 0
    } else if (rule.operator === "eq") {
      values = firstValue ? String(firstValue) : ""
    } else {
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
