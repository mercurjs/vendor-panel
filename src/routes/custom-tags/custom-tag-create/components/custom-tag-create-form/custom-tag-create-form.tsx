import { zodResolver } from "@hookform/resolvers/zod"
import { Button, Heading, Input, Select, Text, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { z } from "zod"
import { Form } from "../../../../../components/common/form"
import {
  RouteFocusModal,
  useRouteModal,
} from "../../../../../components/modals"
import { KeyboundForm } from "../../../../../components/utilities/keybound-form"
import { useCreateCustomTag } from "../../../../../hooks/api"

const CustomTagCreateSchema = z.object({
  value: z.string().min(1),
  type: z.enum(["pet_type", "brand"]),
})

export const CustomTagCreateForm = () => {
  const { t } = useTranslation()
  const { handleSuccess } = useRouteModal()
  const [searchParams] = useSearchParams()
  const typeFromUrl = searchParams.get("type")
  const defaultType = typeFromUrl === "brand" ? "brand" : "pet_type"

  const form = useForm<z.infer<typeof CustomTagCreateSchema>>({
    defaultValues: {
      value: "",
      type: defaultType,
    },
    resolver: zodResolver(CustomTagCreateSchema),
  })

  const { mutateAsync, isPending } = useCreateCustomTag()

  const handleSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      {
        value: data.value,
        type: data.type,
      },
      {
        onSuccess: () => {
          toast.success(t("customTags.create.successToast"))
          handleSuccess()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  return (
    <RouteFocusModal.Form form={form}>
      <KeyboundForm
        className="flex size-full flex-col overflow-hidden"
        onSubmit={handleSubmit}
      >
        <RouteFocusModal.Header />
        <RouteFocusModal.Body className="flex flex-1 justify-center overflow-auto px-6 py-16">
          <div className="flex w-full max-w-[720px] flex-col gap-y-8">
            <div className="flex flex-col gap-y-1">
              <RouteFocusModal.Title asChild>
                <Heading>{t("customTags.create.title")}</Heading>
              </RouteFocusModal.Title>
              <RouteFocusModal.Description asChild>
                <Text size="small" className="text-ui-fg-subtle">
                  {t("customTags.create.subtitle")}
                </Text>
              </RouteFocusModal.Description>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Form.Field
                control={form.control}
                name="type"
                render={({ field: { onChange, ref, ...field } }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t("customTags.fields.type")}</Form.Label>
                      <Form.Control>
                        <Select {...field} onValueChange={onChange}>
                          <Select.Trigger ref={ref}>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="pet_type">
                              {t("petTypes.domain")}
                            </Select.Item>
                            <Select.Item value="brand">
                              {t("brands.domain")}
                            </Select.Item>
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
                name="value"
                render={({ field }) => {
                  return (
                    <Form.Item>
                      <Form.Label>{t("customTags.fields.value")}</Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder={t("customTags.fields.valuePlaceholder")} />
                      </Form.Control>
                      <Form.ErrorMessage />
                    </Form.Item>
                  )
                }}
              />
            </div>
          </div>
        </RouteFocusModal.Body>
        <RouteFocusModal.Footer>
          <div className="flex items-center justify-end gap-2">
            <RouteFocusModal.Close asChild>
              <Button size="small" variant="secondary" type="button">
                {t("actions.cancel")}
              </Button>
            </RouteFocusModal.Close>
            <Button size="small" type="submit" isLoading={isPending}>
              {t("customTags.create.action")}
            </Button>
          </div>
        </RouteFocusModal.Footer>
      </KeyboundForm>
    </RouteFocusModal.Form>
  )
}
