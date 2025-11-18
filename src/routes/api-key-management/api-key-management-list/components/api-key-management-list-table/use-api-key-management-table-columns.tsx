import { AdminApiKeyResponse } from "@medusajs/types"
import { Badge } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { prettifyRedactedToken } from "../../../common/utils"
import { ApiKeyRowActions } from "./api-key-row-actions"

const columnHelper = createColumnHelper<AdminApiKeyResponse["api_key"]>()

export const useApiKeyManagementTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("title", {
        header: t("fields.title"),
        cell: ({ getValue }) => (
          <div className="flex size-full items-center">
            <span className="truncate">{getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor("redacted", {
        header: "Token",
        cell: ({ getValue }) => {
          const token = getValue()
          return <Badge size="2xsmall">{prettifyRedactedToken(token)}</Badge>
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return <ApiKeyRowActions apiKey={row.original as any} />
        },
      }),
    ],
    [t]
  )
}
