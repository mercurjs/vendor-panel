import { Container, Heading } from "@medusajs/ui"
import { PencilSquare } from "@medusajs/icons"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { AdminProductWithAttributes } from "../../../../../types/products"
import { SectionRow } from "../../../../../components/common/section"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { useProductAttributes } from "../../../../../hooks/api/products"

type ProductAttributeSectionProps = {
  product: AdminProductWithAttributes
}

export const ProductAdditionalAttributesSection = ({
  product,
}: ProductAttributeSectionProps) => {
  const { t } = useTranslation()

  const { attributes, isLoading } = useProductAttributes(product.id)

  const attributeList = useMemo(() => {
    return attributes?.map((attribute) => {
      const value =
        product.attribute_values?.filter(Boolean).find((av) => av.attribute_id === attribute.id)
          ?.value || "-"
      return {
        ...attribute,
        value,
      }
    })
  }, [attributes, product.attribute_values])

  if (isLoading) return

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
      {attributeList?.filter(Boolean).map((attribute) => (
        <SectionRow
          key={attribute.id}
          title={attribute.name}
          value={attribute.value}
          tooltip={attribute.description}
        />
      ))}
    </Container>
  )
}
