import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Button, Input } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod"

import { Form } from "../../../../../components/common/form"
import { SwitchBox } from "../../../../../components/common/switch-box"
import { ChipInput } from "../../../../../components/inputs/chip-input"
import { RouteDrawer, useRouteModal } from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { useUpdateProductOption } from "../../../../../hooks/api/products"

type EditProductOptionFormProps = {
  option: HttpTypes.AdminProductOption
}

const EditProductOptionSchema = z.object({
  title: z.string().min(1),
  values: z.array(z.string()).optional(),
  use_for_variations: z.boolean(),
})

export const CreateProductOptionForm = ({
  option,
}: EditProductOptionFormProps) => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()

  const form = useForm<z.infer<typeof EditProductOptionSchema>>({
    defaultValues: {
      title: option.title,
      values: option?.values?.map((v) => v.value),
      use_for_variations: true,
    },
    resolver: zodResolver(EditProductOptionSchema),
  })

  const useForVariations = form.watch("use_for_variations")

  const { mutateAsync, isPending } = useUpdateProductOption(
    option.product_id!,
    option.id
  )

  const handleSubmit = form.handleSubmit(async (data) => {
    const { use_for_variations, ...rest } = data

    if (!use_for_variations) {
      await mutateAsync(
        { convert_to_attribute: true } as any,
        {
          onSuccess: () => {
            handleSuccess()
          },
        }
      )
    } else {
      await mutateAsync(rest as any, {
        onSuccess: () => {
          handleSuccess()
        },
      })
    }
  })

  return (
    <RouteDrawer.Form form={form}>
      <KeyboundForm
        onSubmit={handleSubmit}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <RouteDrawer.Body className="flex flex-1 flex-col gap-y-6 overflow-auto">
          <div className="flex flex-col gap-y-4">
            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => {
                return (
                  <Form.Item>
                    <Form.Label>
                      {t("products.fields.options.optionTitle")}
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        disabled={!useForVariations}
                        placeholder={t(
                          "products.fields.options.optionTitlePlaceholder"
                        )}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
            />
            <Form.Field
              control={form.control}
              name="values"
              render={({ field: { ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Label>
                      {t("products.fields.options.variations")}
                    </Form.Label>
                    <Form.Control>
                      <ChipInput
                        {...field}
                        disabled={!useForVariations}
                        placeholder={t(
                          "products.fields.options.variantionsPlaceholder"
                        )}
                      />
                    </Form.Control>
                    <Form.ErrorMessage />
                  </Form.Item>
                )
              }}
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

          {!useForVariations && (
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
