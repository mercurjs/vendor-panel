import { useSearchParams } from "react-router-dom"
import { _DataTable } from "../../../../components/table/data-table/data-table"
import { useOrderReturnRequests } from "../../../../hooks/api/requests"
import { useDataTable } from "../../../../hooks/use-data-table"

import { useOrderReturnRequestTableColumns } from "./user-order-return-request-table-columns"

const PAGE_SIZE = 10

export const RequestReturnListTable = ({
  customColumns,
}: {
  customColumns?: any
}) => {
  const [searchParams] = useSearchParams()
  const offset = searchParams.get("offset") || "0"

  const { order_return_request, count, isPending, isError, error } =
    useOrderReturnRequests({
      limit: PAGE_SIZE,
      offset,
    })

  const columns = useOrderReturnRequestTableColumns()

  const { table } = useDataTable({
    data: order_return_request,
    columns: customColumns || columns,
    count,
    enablePagination: true,
    getRowId: (row: any) => row?.id || "",
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  return (
    <div>
      <_DataTable
        table={table}
        columns={customColumns || columns}
        pageSize={PAGE_SIZE}
        count={count}
        isLoading={isPending}
        pagination
        navigateTo={({ original }: any) => {
          return `/requests/orders/${original.id}/review`
        }}
        search={false}
      />
    </div>
  )
}
