import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"

import { useTranslation } from "react-i18next"
import {
  TextCell,
  TextHeader,
} from "../../../components/table/table-cells/common/text-cell"
import { HttpTypes } from "@medusajs/types"

const columnHelper = createColumnHelper<HttpTypes.AdminCustomerGroup>()

export const useCustomerGroupTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => <TextHeader text={t("fields.name")} />,
        cell: ({ row }) => {
          return (
            <TextCell
              text={
                row.original?.customer_group?.name || row.original?.name || "-"
              }
            />
          )
        },
      }),
      // columnHelper.accessor("customers", {
      //   header: () => <TextHeader text={t("customers.domain")} />,
      //   cell: ({ row }) => {
      //     const count = row.original?.customer_group?.customers.length ?? 0
      //     return <TextCell text={`${count}`} />
      //   },
      // }),
    ],
    [t]
  )
}
