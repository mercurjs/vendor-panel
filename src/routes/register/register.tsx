import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, Button, Heading, Hint, Input, Text } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import * as z from "zod"

import { Form } from "../../components/common/form"
import AvatarBox from "../../components/common/logo-box/avatar-box"
import { useSignUpWithEmailPass } from "../../hooks/api"
import { isFetchError } from "../../lib/is-fetch-error"
import { useState } from "react"

const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name should be a string" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(2, { message: "Password should be a string" }),
  confirmPassword: z.string().min(2, {
    message: "Confirm Password should be a string",
  }),
})

export const Register = () => {
  const [success, setSuccess] = useState(false)
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const { mutateAsync, isPending } = useSignUpWithEmailPass()

  const handleSubmit = form.handleSubmit(
    async ({ name, email, password, confirmPassword }) => {
      if (password !== confirmPassword) {
        form.setError("password", {
          type: "manual",
          message: "Password and Confirm Password not matched",
        })
        form.setError("confirmPassword", {
          type: "manual",
          message: "Password and Confirm Password not matched",
        })

        return null
      }

      await mutateAsync(
        {
          name,
          email,
          password,
          confirmPassword,
        },
        {
          onError: (error) => {
            if (isFetchError(error)) {
              if (error.status === 401) {
                form.setError("email", {
                  type: "manual",
                  message: error.message,
                })

                return
              }
            }

            form.setError("root.serverError", {
              type: "manual",
              message: error.message,
            })
          },
          onSuccess: () => {
            setSuccess(true)
          },
        }
      )
    }
  )

  const serverError = form.formState.errors?.root?.serverError?.message
  const validationError =
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.name?.message ||
    form.formState.errors.confirmPassword?.message

  if (success)
    return (
      <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
        <div className="mb-4 flex flex-col items-center">
          <Heading>Thank You for registering!</Heading>
          <Text
            size="small"
            className="text-ui-fg-subtle text-center mt-2 max-w-[320px]"
          >
            You may need to wait for admin authorization before logging in. A
            confirmation email will be sent to you shortly.
          </Text>

          <Link to="/login">
            <Button className="mt-8">Back to login page</Button>
          </Link>
        </div>
      </div>
    )

  return (
    <div className="bg-ui-bg-subtle flex min-h-dvh w-dvw items-center justify-center">
      <div className="m-4 flex w-full max-w-[280px] flex-col items-center">
        <AvatarBox />
        <div className="mb-4 flex flex-col items-center">
          <Heading>{t("register.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle text-center">
            {t("register.hint")}
          </Text>
        </div>
        <div className="flex w-full flex-col gap-y-3">
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-y-6"
            >
              <div className="flex flex-col gap-y-2">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Control>
                          <Input
                            {...field}
                            className="bg-ui-bg-field-component mb-2"
                            placeholder="Company name"
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="email"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Control>
                          <Input
                            {...field}
                            className="bg-ui-bg-field-component"
                            placeholder={t("fields.email")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="password"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>{}</Form.Label>
                        <Form.Control>
                          <Input
                            type="password"
                            {...field}
                            className="bg-ui-bg-field-component"
                            placeholder={t("fields.password")}
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
                <Form.Field
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => {
                    return (
                      <Form.Item>
                        <Form.Label>{}</Form.Label>
                        <Form.Control>
                          <Input
                            type="password"
                            {...field}
                            className="bg-ui-bg-field-component"
                            placeholder="Confirm Password"
                          />
                        </Form.Control>
                      </Form.Item>
                    )
                  }}
                />
              </div>
              {validationError && (
                <div className="text-center">
                  <Hint className="inline-flex" variant={"error"}>
                    {validationError}
                  </Hint>
                </div>
              )}
              {serverError && (
                <Alert
                  className="bg-ui-bg-base items-center p-2"
                  dismissible
                  variant="error"
                >
                  {serverError}
                </Alert>
              )}
              <Button className="w-full" type="submit" isLoading={isPending}>
                Sign up
              </Button>
            </form>
          </Form>
        </div>
        <span className="text-ui-fg-muted txt-small my-6">
          <Trans
            i18nKey="register.alreadySeller"
            components={[
              <Link
                to="/login"
                className="text-ui-fg-interactive transition-fg hover:text-ui-fg-interactive-hover focus-visible:text-ui-fg-interactive-hover font-medium outline-none"
              />,
            ]}
          />
        </span>
      </div>
    </div>
  )
}
