import { Heading, Select } from "@medusajs/ui"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { Form } from "../../../../../../../components/common/form"
import { SwitchBox } from "../../../../../../../components/common/switch-box"
import { Combobox } from "../../../../../../../components/inputs/combobox"
import { useComboboxData } from "../../../../../../../hooks/use-combobox-data"
import { fetchQuery } from "../../../../../../../lib/client"
import { ProductCreateSchemaType } from "../../../../types"
import { CategoryCombobox } from "../../../../../common/components/category-combobox"

type ProductCreateOrganizationSectionProps = {
  form: UseFormReturn<ProductCreateSchemaType>
}

export const ProductCreateOrganizationSection = ({
  form,
}: ProductCreateOrganizationSectionProps) => {
  const { t } = useTranslation()

  const collections = useComboboxData({
    queryKey: ["product_collections"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-collections", {
        method: "GET",
        query: params,
      }),
    getOptions: (data) =>
      data.product_collections.map((collection: any) => ({
        label: collection.title!,
        value: collection.id!,
      })),
  })

  // Fetch pet types from backend
  const petTypesData = useComboboxData({
    queryKey: ["custom_tags", "pet_type"],
    queryFn: (params) =>
      fetchQuery("/vendor/custom-tags", {
        method: "GET",
        query: { ...params, type: "pet_type" },
      }),
    getOptions: (data) =>
      data.tags?.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })) || [],
  })

  // Fetch brands from backend
  const brandsData = useComboboxData({
    queryKey: ["custom_tags", "brand"],
    queryFn: (params) =>
      fetchQuery("/vendor/custom-tags", {
        method: "GET",
        query: { ...params, type: "brand" },
      }),
    getOptions: (data) =>
      data.tags?.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })) || [],
  })

  const petTypeOptions = petTypesData.options
  const brandOptions = brandsData.options

  return (
    <div id="organize" className="flex flex-col gap-y-8">
      <Heading>{t("products.organization.header")}</Heading>
      <SwitchBox
        control={form.control}
        name="discountable"
        label={t("products.fields.discountable.label")}
        description={t("products.fields.discountable.hint")}
        optional
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Form.Field
          control={form.control}
          name="collection_id"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t("products.fields.collection.label")}
                </Form.Label>
                <Form.Control>
                  <Combobox
                    {...field}
                    options={collections.options}
                    searchValue={collections.searchValue}
                    onSearchValueChange={collections.onSearchValueChange}
                    fetchNextPage={collections.fetchNextPage}
                    allowClear
                  />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )
          }}
        />
        <Form.Field
          control={form.control}
          name="categories"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t("products.fields.categories.label")}
                </Form.Label>
                <Form.Control>
                  <CategoryCombobox {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )
          }}
        />
        <Form.Field
          control={form.control}
          name="custom_tag_1"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t("products.fields.petType.label" as any)}
                </Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {petTypeOptions.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )
          }}
        />
        <Form.Field
          control={form.control}
          name="custom_tag_2"
          render={({ field }) => {
            return (
              <Form.Item>
                <Form.Label optional>
                  {t("products.fields.brand.label" as any)}
                </Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {brandOptions.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )
          }}
        />
      </div>
    </div>
  )
}
