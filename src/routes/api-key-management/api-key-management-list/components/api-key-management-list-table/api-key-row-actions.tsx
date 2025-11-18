import { SquareTwoStack, Trash } from "@medusajs/icons"
import { AdminApiKeyResponse } from "@medusajs/types"
import { toast, usePrompt } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { useDeleteApiKey } from "../../../../../hooks/api/api-keys"

export const ApiKeyRowActions = ({
  apiKey,
}: {
  apiKey: AdminApiKeyResponse["api_key"]
}) => {
  const { mutateAsync: deleteAsync } = useDeleteApiKey(apiKey.id)

  const { t } = useTranslation()
  const prompt = usePrompt()

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("apiKeyManagement.delete.warning", {
        title: apiKey.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await deleteAsync(undefined, {
      onSuccess: () => {
        toast.success(
          t("apiKeyManagement.delete.successToast", {
            title: apiKey.title,
          })
        )
      },
      onError: (err) => {
        toast.error(err.message)
      },
    })
  }

  const handleCopyToken = () => {
    navigator.clipboard.writeText(apiKey.token)
    toast.success(t("apiKeyManagement.actions.copySuccessToast"))
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            ...(apiKey.type !== "secret"
              ? [
                  {
                    label: t("apiKeyManagement.actions.copy"),
                    onClick: handleCopyToken,
                    icon: <SquareTwoStack />,
                  },
                ]
              : []),
          ],
        },
        {
          actions: [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}
