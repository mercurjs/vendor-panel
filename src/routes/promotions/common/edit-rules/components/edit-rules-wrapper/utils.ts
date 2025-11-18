import { ExtendedPromotionRule } from "../../../../../../types/promotion"

export const getRuleValue = (rule: ExtendedPromotionRule) => {
  if (rule.field_type === "number") {
    return parseInt(rule.values as unknown as string)
  }

  return rule.values
}
