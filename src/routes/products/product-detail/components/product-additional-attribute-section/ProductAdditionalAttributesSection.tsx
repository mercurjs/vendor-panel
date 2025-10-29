import { Container, Heading } from "@medusajs/ui"

import { ExtendedAdminProduct } from "../../../../../types/extended-product"
import { PencilSquare } from "@medusajs/icons"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { SectionRow } from "../../../../../components/common/section"

type ProductAttributeSectionProps = {
  product: ExtendedAdminProduct & { attribute_values: any[] }
}

export const ProductAdditionalAttributesSection = ({
  product,
}: ProductAttributeSectionProps) => {
  const { attribute_values } = product

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Additional Attributes</Heading>
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
      {attribute_values.map((attribute) => (
        <SectionRow
          key={attribute.id}
          title={attribute.attribute.name}
          value={attribute.value}
          tooltip={attribute.attribute.description ?? undefined}
        />
      ))}
    </Container>
  )
}
