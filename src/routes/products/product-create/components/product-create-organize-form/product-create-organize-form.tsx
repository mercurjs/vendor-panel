import { UseFormReturn } from "react-hook-form"

import {
  FormExtensionZone,
  useDashboardExtension,
} from "../../../../../extensions"
import { ProductCreateSchemaType } from "../../types"
import { ProductCreateOrganizationSection } from "./components/product-create-organize-section"

type ProductAttributesProps = {
  form: UseFormReturn<ProductCreateSchemaType>
}

export const ProductCreateOrganizeForm = ({ form }: ProductAttributesProps) => {
  const { getFormFields } = useDashboardExtension()
  const fields = getFormFields("product", "create", "organize")

  return (
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8">
        <ProductCreateOrganizationSection form={form} />
        <FormExtensionZone fields={fields} form={form} />
      </div>
    </div>
  )
}
