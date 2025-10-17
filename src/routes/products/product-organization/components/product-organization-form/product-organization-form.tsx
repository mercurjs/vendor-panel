import { Button, toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
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
import { useUpdateProduct } from "../../../../../hooks/api/products"
import { useComboboxData } from "../../../../../hooks/use-combobox-data"
import { fetchQuery } from "../../../../../lib/client"
import { AdminProductWithAttributes } from "../../../../../types/products"

type ProductOrganizationFormProps = {
  product: AdminProductWithAttributes
}

const ProductOrganizationSchema = zod.object({
  type_id: zod.string().nullable(),
  collection_id: zod.string().nullable(),
  primary_category_id: zod.string().nullable(),
  secondary_category_ids: zod.array(zod.string()),
  tag_ids: zod.array(zod.string()),
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

  const types = useComboboxData({
    queryKey: ["product_types"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-types", {
        method: "GET",
        query: params as { [key: string]: string | number },
      }),
    getOptions: (data) =>
      data.product_types.map((type: any) => ({
        label: type.value,
        value: type.id,
      })),
  })

  const tags = useComboboxData({
    queryKey: ["product_tags"],
    queryFn: (params) =>
      fetchQuery("/vendor/product-tags", {
        method: "GET",
        query: params as { [key: string]: string | number },
      }),
    getOptions: (data) =>
      data.product_tags.map((tag: any) => ({
        label: tag.value,
        value: tag.id,
      })),
  })

  const form = useExtendableForm({
    defaultValues: {
      type_id: product.type_id ?? "",
      collection_id: product.collection_id ?? "",
      primary_category_id: product.categories?.[0]?.id || "",
      secondary_category_ids:
        product.secondary_categories
          ?.map((sc) => sc.category_id)
          .filter((id) => id !== product.categories?.[0]?.id) || [], // Filter out primary category
      tag_ids: product.tags?.map((t) => t.id) || [],
    },
    schema: ProductOrganizationSchema,
    configs: configs,
    data: product,
  })

  const { mutateAsync, isPending } = useUpdateProduct(product.id)

  // Watch for changes in primary category and remove it from secondary categories
  const primaryCategoryId = form.watch("primary_category_id")
  useEffect(() => {
    if (primaryCategoryId) {
      const currentSecondaryIds = form.getValues("secondary_category_ids")
      if (currentSecondaryIds?.includes(primaryCategoryId)) {
        form.setValue(
          "secondary_category_ids",
          currentSecondaryIds.filter((id) => id !== primaryCategoryId)
        )
      }
    }
  }, [primaryCategoryId, form])

  const handleSubmit = form.handleSubmit(async (data) => {
    // Filter out primary category from secondary categories to avoid duplicates
    const filteredSecondaryCategories = (data.secondary_category_ids || []).filter(
      (id) => id !== data.primary_category_id
    )

    await mutateAsync(
      {
        type_id: data.type_id || null,
        collection_id: data.collection_id || null,
        categories: data.primary_category_id
          ? [{ id: data.primary_category_id }]
          : [],
        tags: data.tag_ids?.map((t) => ({ id: t })),
        additional_data: {
          secondary_categories: [
            {
              product_id: product.id,
              secondary_categories_ids: filteredSecondaryCategories,
            },
          ],
        },
      } as any,
      {
        onSuccess: ({ product }) => {
          toast.success(
            t("products.organization.edit.toasts.success", {
              title: product.title,
            })
          )
          handleSuccess()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm onSubmit={handleSubmit} className="flex h-full flex-col">
        <RouteDrawer.Body>
          <div className="flex h-full flex-col gap-y-4">
            <Form.Field
              control={form.control}
              name="type_id"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.type.label")}
                    </Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        options={types.options}
                        searchValue={types.searchValue}
                        onSearchValueChange={types.onSearchValueChange}
                        fetchNextPage={types.fetchNextPage}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
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
              name="primary_category_id"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.primaryCategory.label")}
                    </Form.Label>
                    <Form.Control>
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
            <Form.Field
              control={form.control}
              name="secondary_category_ids"
              render={({ field }) => {
                // Filter out primary category from secondary categories options
                const filteredOptions = categories.options.filter(
                  (option) => option.value !== primaryCategoryId
                )

                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.secondaryCategories.label")}
                    </Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        multiple
                        options={filteredOptions}
                        onSearchValueChange={categories.onSearchValueChange}
                        searchValue={categories.searchValue}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="tag_ids"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label optional>
                      {t("products.fields.tags.label")}
                    </Form.Label>
                    <Form.Control>
                      <Combobox
                        {...field}
                        multiple
                        options={tags.options}
                        onSearchValueChange={tags.onSearchValueChange}
                        searchValue={tags.searchValue}
                      />
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
