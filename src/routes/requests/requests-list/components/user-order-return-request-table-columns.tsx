import { createColumnHelper } from "@tanstack/react-table"
import { DateCell } from "../../../../components/table/table-cells/common/date-cell"
import { StatusCell } from "../../../../components/table/table-cells/common/status-cell"

const columnHelper = createColumnHelper<any>()

const getStatusColor: any = (status: string) => {
  switch (status) {
    case "pending":
      return "orange"
    case "refunded":
      return "green"
    case "withdrawn":
      return "yellow"
    case "escalated":
      return "red"
    default:
      return "orange"
  }
}

export const useOrderReturnRequestTableColumns = () => {
  return [
    columnHelper.accessor("id", {
      header: "Order",
      cell: ({ row }) => `#${row.original.order.display_id}`,
    }),
    columnHelper.accessor("order.customer.first_name", {
      header: "Customer",
      cell: ({ row }) =>
        `${row.original.order.customer.first_name} ${row.original.order.customer.last_name}`,
    }),
    columnHelper.accessor("order.customer.email", {
      header: "Customer Email",
      cell: ({ row }) => row.original.order.customer.email,
    }),
    columnHelper.accessor("customer_note", {
      header: "Reason",
      cell: ({ row }) => row.original.customer_note,
    }),
    columnHelper.accessor("created_at", {
      header: "Date",
      cell: ({ row }) => <DateCell date={row.original.created_at} />,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ row }) => {
        return (
          <div className="flex h-full w-full items-center overflow-hidden">
            <span className="truncate uppercase">
              <StatusCell color={getStatusColor(row.original.status)}>
                {row.original.status}
              </StatusCell>
            </span>
          </div>
        )
      },
    }),
  ]
}
