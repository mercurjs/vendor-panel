import { InlineTip } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

type InlineTipWrapperProps = {
  show?: boolean
  className?: string
  label?: string
  description?: string
}

export const InlineTipWrapper = ({ 
  show = true, 
  className = "bg-transparent border-none w-[684px]",
  label,
  description
}: InlineTipWrapperProps) => {
  const { t } = useTranslation()

  if (!show) {
    return null
  }

  return (
    <div className="p-4">
      <InlineTip
        label={label || t("general.tip")}
        className={className}
      >
        {description || t("products.create.variants.productVariants.tip")}
      </InlineTip>
    </div>
  )
}
