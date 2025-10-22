import { Container, Heading } from "@medusajs/ui"

import { HttpTypes } from "@medusajs/types"
import { PencilSquare } from "@medusajs/icons"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { SectionRow } from "../../../../../components/common/section"
import { useTranslation } from "react-i18next"

type ProductAttributeSectionProps = {
  product: HttpTypes.AdminProduct & { attribute_values: any[] }
}

export const ProductAdditionalAttributesSection = ({
  product,
}: ProductAttributeSectionProps) => {
  const { t } = useTranslation()
  const { attribute_values } = product


  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("products.attributes")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: "Edit",
                  to: "additional-attributes",
                  icon: <PencilSquare />,
                },
              ],
            },
          ]}
        />
      </div>
      {attribute_values
        .filter(Boolean)
        .map((attribute) => (
          <SectionRow
            key={attribute.id}
            title={attribute.attribute.name}
            value={attribute.value}
            tooltip={attribute.attribute.description}
          />
        ))}
    </Container>
  )
}
