import {
  CreatePromotionRuleDTO,
  HttpTypes,
  PromotionRuleDTO,
  PromotionRuleOperatorValues,
} from "@medusajs/types"
import { useRouteModal } from "../../../../../../components/modals"
import {
  usePromotionAddRules,
  usePromotionRemoveRules,
  usePromotionUpdateRules,
  useUpdatePromotion,
} from "../../../../../../hooks/api/promotions"
import { ExtendedPromotionRule } from "../../../../../../types/promotion"
import { RuleTypeValues } from "../../edit-rules"
import { EditRulesForm } from "../edit-rules-form"
import { getRuleValue } from "./utils"

type EditPromotionFormProps = {
  promotion: HttpTypes.AdminPromotion
  rules: PromotionRuleDTO[]
  ruleType: RuleTypeValues
}

export const EditRulesWrapper = ({
  promotion,
  rules,
  ruleType,
}: EditPromotionFormProps) => {
  const { handleSuccess } = useRouteModal()
  const { mutateAsync: updatePromotion } = useUpdatePromotion(promotion.id)
  const { mutateAsync: addPromotionRules } = usePromotionAddRules(
    promotion.id,
    ruleType
  )

  const { mutateAsync: removePromotionRules } = usePromotionRemoveRules(
    promotion.id,
    ruleType
  )

  const { mutateAsync: updatePromotionRules, isPending } =
    usePromotionUpdateRules(promotion.id, ruleType)

  const handleSubmit = (
    rulesToRemove?: { id: string; disguised?: boolean; attribute: string }[]
  ) => {
    return async function (data: { rules: ExtendedPromotionRule[] }) {
      const applicationMethodData: Record<string, string | number | null> = {}
      const { rules: allRules = [] } = data
      const disguisedRules = allRules.filter((rule) => rule.disguised)
      const disguisedRulesToRemove =
        rulesToRemove?.filter((r) => r.disguised) || []

      // For all the rules that were disguised, convert them to actual values in the
      // database, they are currently all under application_method. If more of these are coming
      // up, abstract this away.
      for (const rule of disguisedRules) {
        const ruleValue = getRuleValue(rule)
        applicationMethodData[rule.attribute!] = Array.isArray(ruleValue) 
          ? ruleValue[0]?.value || null
          : ruleValue
      }

      for (const rule of disguisedRulesToRemove) {
        applicationMethodData[rule.attribute] = null
      }

      const rulesData = allRules.filter((rule) => !rule.disguised)
      
      const rulesToCreate: CreatePromotionRuleDTO[] = []
      const rulesToUpdate: ExtendedPromotionRule[] = []
      
      for (const rule of rulesData) {
        if ("id" in rule && typeof rule.id === "string") {
          rulesToUpdate.push(rule)
        } else {
          rulesToCreate.push({
            attribute: rule.attribute!,
            operator: rule.operator!,
            values: rule.values as unknown as string | string[],
          })
        }
      }

      if (Object.keys(applicationMethodData).length) {
        await updatePromotion({
          application_method: applicationMethodData,
        } as any)
      }

      if (rulesToCreate.length) {
        await addPromotionRules({
          rules: rulesToCreate,
        })
      }

      if (rulesToRemove?.length) {
        await removePromotionRules({
          rules: rulesToRemove.map((r) => r.id).filter(Boolean) as string[],
        } as any)
      }

      if (rulesToUpdate.length) {
        await updatePromotionRules({
          rules: rulesToUpdate.map((rule) => ({
            id: rule.id,
            attribute: rule.attribute,
            operator: rule.operator as PromotionRuleOperatorValues,
            values: rule.values as unknown as string | string[],
          })),
        })
      }

      handleSuccess()
    }
  }

  return (
    <EditRulesForm
      promotion={promotion}
      rules={rules}
      ruleType={ruleType}
      handleSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  )
}
