import { ExtendedAdminProduct } from "../../../../../types/products"
import { Button, Select, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import * as zod from "zod"

import { Form } from "../../../../../components/common/form"
import { Combobox } from "../../../../../components/inputs/combobox"
import { RouteDrawer, useRouteModal } from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import {
  FormExtensionZone,
  useDashboardExtension,
  useExtendableForm,
} from "../../../../../extensions"
import { productsQueryKeys, useUpdateProduct } from "../../../../../hooks/api/products"
import { useComboboxData } from "../../../../../hooks/use-combobox-data"
import { fetchQuery } from "../../../../../lib/client"
import { queryClient } from "../../../../../lib/query-client"

type ProductOrganizationFormProps = {
  product: ExtendedAdminProduct
}

const ProductOrganizationSchema = zod.object({
  collection_id: zod.string().nullable(),
  category_ids: zod.string().nullable(),
  // category_ids: zod.array(zod.string()),
  custom_tag_1: zod.string().nullable().optional(), // pet_type
  custom_tag_2: zod.string().nullable().optional(), // brand
})

export const ProductOrganizationForm = ({
  product,
}: ProductOrganizationFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const { getFormConfigs, getFormFields } = useDashboardExtension()

  const configs = getFormConfigs("product", "organize")
  const fields = getFormFields("product", "organize")

  const categories = useComboboxData({
    queryKey: ["product_categories"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-categories", {
        method: "GET",
        query: params as Record<string, string | number>,
      }),
    getOptions: (data) =>
      data.product_categories.map((category: any) => ({
        label: category.name!,
        value: category.id!,
      })),
  })

  const collections = useComboboxData({
    queryKey: ["product_collections"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-collections", {
        method: "GET",
        query: params as Record<string, string | number>,
      }),
    getOptions: (data) =>
      data.product_collections.map((collection: any) => ({
        label: collection.title!,
        value: collection.id!,
      })),
  })

  // Fetch custom tags (pet types)
  const petTypesData = useComboboxData({
    queryKey: ["custom_tags", "pet_type"],
    queryFn: (params) =>
      fetchQuery("/vendor/custom-tags", {
        method: "GET",
        query: { ...(params as Record<string, any>), type: "pet_type" },
      }),
    getOptions: (data) =>
      data.tags?.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })) || [],
  })

  // Fetch custom tags (brands)
  const brandsData = useComboboxData({
    queryKey: ["custom_tags", "brand"],
    queryFn: (params) =>
      fetchQuery("/vendor/custom-tags", {
        method: "GET",
        query: { ...(params as Record<string, any>), type: "brand" },
      }),
    getOptions: (data) =>
      data.tags?.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })) || [],
  })

  const form = useExtendableForm({
    defaultValues: {
      collection_id: product.collection_id ?? "",
      category_ids: product.categories?.[0]?.id || "",
      custom_tag_1:
        (product.custom_tags || []).find((ct) => ct.type === "pet_type")?.id || "",
      custom_tag_2:
        (product.custom_tags || []).find((ct) => ct.type === "brand")?.id || "",
    },
    schema: ProductOrganizationSchema,
    configs: configs,
    data: product,
  })

  const { mutateAsync, isPending } = useUpdateProduct(product.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    const selectedTagIds = [data.custom_tag_1, data.custom_tag_2]
      .filter((v): v is string => !!v)
    const existingTagIds =
      (product.custom_tags || [])
        .filter((ct) => ct.type === "pet_type" || ct.type === "brand")
        .map((ct) => ct.id) || []
    const hasTagChanges =
      selectedTagIds.length !== existingTagIds.length ||
      selectedTagIds.some((id) => !existingTagIds.includes(id))

    try {
      await mutateAsync({
        collection_id: data.collection_id ? data.collection_id : undefined,
        categories: data.category_ids ? [{ id: data.category_ids }] : [],
      })

      if (hasTagChanges && existingTagIds.length) {
        await fetchQuery(`/vendor/products/${product.id}/custom-tags`, {
          method: "DELETE",
          body: { tag_ids: existingTagIds },
        })
      }

      if (selectedTagIds.length) {
        await fetchQuery(`/vendor/products/${product.id}/custom-tags`, {
          method: "POST",
          body: { tag_ids: selectedTagIds },
        })
      }

      await queryClient.invalidateQueries({
        queryKey: productsQueryKeys.detail(product.id),
      })

      toast.success(
        t("products.organization.edit.toasts.success", {
          title: product.title,
        })
      )
      handleSuccess()
    } catch (error: any) {
      toast.error(error.message)
    }
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm onSubmit={handleSubmit} className="flex h-full flex-col">
        <RouteDrawer.Body>
          <div className="flex h-full flex-col gap-y-4">
            {/* Removed type field */}
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
                        multiple={false}
                        options={collections.options}
                        onSearchValueChange={collections.onSearchValueChange}
                        searchValue={collections.searchValue}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="category_ids"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.categories.label")}
                    </Form.Label>
                    <Form.Control>
                      {/* <CategoryCombobox {...field} /> */}
                      <Combobox
                        {...field}
                        multiple={false}
                        options={categories.options}
                        onSearchValueChange={categories.onSearchValueChange}
                        searchValue={categories.searchValue}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            {/* Custom Tags: Pet Type */}
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
                      <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {petTypesData.options.map((option) => (
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
            {/* Custom Tags: Brand */}
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
                      <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {brandsData.options.map((option) => (
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
            <FormExtensionZone fields={fields} form={form} />
          </div>
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button size="small" variant="secondary">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button size="small" type="submit" isLoading={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
