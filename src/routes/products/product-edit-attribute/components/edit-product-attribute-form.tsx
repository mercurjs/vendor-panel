import { zodResolver } from "@hookform/resolvers/zod"
import { InformationCircleSolid } from "@medusajs/icons"
import { Alert, Button, Text, Tooltip } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { Form } from "../../../../components/common/form"
import { SwitchBox } from "../../../../components/common/switch-box"
import { ChipInput } from "../../../../components/inputs/chip-input"
import { Combobox } from "../../../../components/inputs/combobox"
import { RouteDrawer, useRouteModal } from "../../../../components/modals"
import { KeyboundForm } from "../../../../components/utilities/keybound-form"
import { useUpdateProductAttribute } from "../../../../hooks/api/products"
import {
  ProductAttribute,
  ProductInformationalAttribute,
} from "../../../../types/products"

type EditProductAttributeFormProps = {
  productId: string
  attribute: ProductInformationalAttribute
  attributeDefinition?: ProductAttribute
}

const EditProductAttributeSchema = z.object({
  values: z.array(z.string()).min(1),
  use_for_variations: z.boolean(),
})

export const EditProductAttributeForm = ({
  productId,
  attribute,
  attributeDefinition,
}: EditProductAttributeFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const currentValues = attribute.values
    ?.filter((v) => v.is_editable || attribute.attribute_source === "vendor")
    .map((v) => v.value) ?? []

  const form = useForm<z.infer<typeof EditProductAttributeSchema>>({
    defaultValues: {
      values: currentValues,
      use_for_variations: false,
    },
    resolver: zodResolver(EditProductAttributeSchema),
  })

  const useForVariations = form.watch("use_for_variations")

  const { mutateAsync, isPending } = useUpdateProductAttribute(
    productId,
    attribute.attribute_id
  )

  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      {
        values: data.values,
        use_for_variations: data.use_for_variations,
      },
      {
        onSuccess: () => {
          handleSuccess()
        },
      }
    )
  })

  const isSelectType =
    attributeDefinition?.ui_component === "select" &&
    attributeDefinition.possible_values?.length > 0

  const comboboxOptions =
    attributeDefinition?.possible_values?.map((pv) => ({
      value: pv.value,
      label: pv.value,
    })) ?? []

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-1 flex-col gap-y-6 overflow-auto">
          <div className="flex flex-col gap-y-2">
            <Text size="small" weight="plus" className="flex items-center gap-x-2">
              {attribute.name}
              {attribute.description && (
                <Tooltip content={attribute.description}>
                  <InformationCircleSolid className="text-ui-fg-muted" />
                </Tooltip>
              )}
            </Text>

            <Form.Field
              control={form.control}
              name="values"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    {isSelectType ? (
                      <Combobox
                        value={field.value}
                        onChange={(val) => field.onChange(val ?? [])}
                        options={comboboxOptions}
                        placeholder={t(
                          "products.attributes.edit.valuesPlaceholder",
                          "Select values"
                        )}
                      />
                    ) : (
                      <ChipInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={t(
                          "products.attributes.edit.valuesPlaceholder",
                          "Type and press Enter"
                        )}
                      />
                    )}
                  </Form.Control>
                  <Form.ErrorMessage />
                </Form.Item>
              )}
            />
          </div>

          <SwitchBox
            control={form.control}
            name="use_for_variations"
            label={t(
              "products.attributes.edit.useForVariations",
              "Use for variations"
            )}
            description={t(
              "products.attributes.edit.useForVariationsDescription",
              "If checked, we will create variants using this attribute. If not, the attribute will be used for informational purposes only."
            )}
          />

          {useForVariations && (
            <Alert variant="warning" dismissible={false}>
              {t(
                "products.attributes.edit.conversionWarning",
                "Warning: Changes to this attribute may affect existing product variants or details. Review your variants and product details after saving."
              )}
            </Alert>
          )}
        </RouteDrawer.Body>
        <RouteDrawer.Footer>
          <div className="flex items-center justify-end gap-x-2">
            <RouteDrawer.Close asChild>
              <Button variant="secondary" size="small">
                {t("actions.cancel")}
              </Button>
            </RouteDrawer.Close>
            <Button type="submit" size="small" isLoading={isPending}>
              {t("actions.save")}
            </Button>
          </div>
        </RouteDrawer.Footer>
      </KeyboundForm>
    </RouteDrawer.Form>
  )
}
