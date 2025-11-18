import { StatusCell as StatusCell_ } from "../../../components/table/table-cells/common/status-cell"

type StatusCellProps = {
  status: "pending" | "connected" | "not connected"
}

const getStatusColor: any = (status: string) => {
  switch (status) {
    case "pending":
      return "orange"
    case "connected":
      return "green"
    case "not connected":
      return "red"
    default:
      return "grey"
  }
}

export const Status = ({ status }: StatusCellProps) => {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <span className="truncate capitalize">
        <StatusCell_ color={getStatusColor(status)}>{status}</StatusCell_>
      </span>
    </div>
  )
}
