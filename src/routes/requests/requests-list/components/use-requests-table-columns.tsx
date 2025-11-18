import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DateCell } from "../../../../components/table/table-cells/common/date-cell"
import { StatusCell } from "../../../../components/table/table-cells/request/status-cell"
import { RequestsActions } from "./requests-actions"

const columnHelper = createColumnHelper<any>()

export const useRequestsTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("data.name", {
        header: "Title",
        cell: ({ row }) => row.original.data.title || row.original.data.name,
      }),
      columnHelper.accessor("data.handle", {
        header: "Handle",
        cell: ({ row }) => row.original.data.handle,
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: ({ getValue }) => <DateCell date={getValue()} />,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => <StatusCell status={getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          const request = row.original

          if (request.status !== "pending") return null

          return <RequestsActions request={request} />
        },
      }),
    ],
    [t]
  )
}
