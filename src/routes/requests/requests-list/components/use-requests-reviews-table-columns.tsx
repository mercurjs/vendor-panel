import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { DateCell } from "../../../../components/table/table-cells/common/date-cell"
import { StatusCell } from "../../../../components/table/table-cells/request/status-cell"
import { RequestsActions } from "./requests-actions"

const columnHelper = createColumnHelper<any>()

export const useRequestsReviewsTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("data.review_id", {
        header: "Review",
        cell: ({ getValue }) => getValue(),
      }),
      columnHelper.accessor("data.reason", {
        header: "Reason",
        cell: ({ row }) => {
          const reason =
            row.original?.data.reason?.split("comment: ")[0] ||
            row.original.data.reason

          return <p className="truncate max-w-[360px]">{reason}</p>
        },
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
