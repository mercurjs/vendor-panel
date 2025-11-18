import { CalendarMini, TriangleRightMini } from "@medusajs/icons"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  Badge,
  Button,
  Container,
  DateRange,
  Heading,
  Popover,
  Text,
} from "@medusajs/ui"
import { Link, useSearchParams } from "react-router-dom"
import { useStatistics } from "../../../hooks/api"
import { ChartSkeleton } from "./chart-skeleton"
import { useState } from "react"
import { addDays, differenceInDays, format, subDays } from "date-fns"
import { Calendar } from "../../../components/common/calendar/calendar"
import { useUnreads } from "@talkjs/react"

const colorPicker = (line: string) => {
  switch (line) {
    case "customers":
      return "#2563eb"
    case "orders":
      return "#60a5fa"
    default:
      return ""
  }
}

const generateChartData = ({
  range,
  customers,
  orders,
}: {
  range: DateRange | undefined
  customers: { date: string; count: string }[]
  orders: { date: string; count: string }[]
}) => {
  const res = [
    ...Array(
      differenceInDays(
        range?.to || addDays(new Date(), +1),
        range?.from || addDays(new Date(), -7)
      ) + 1
    ).keys(),
  ].map((index) => ({
    date: format(
      subDays(range?.from || addDays(new Date(), index), -index),
      "yyyy-MM-dd"
    ),
    orders: parseInt(
      orders?.find(
        (item) =>
          format(item.date, "yyyy-MM-dd") ===
          format(
            subDays(range?.from || addDays(new Date(), index), -index),
            "yyyy-MM-dd"
          )
      )?.count || "0"
    ),
    customers: parseInt(
      customers?.find(
        (item) =>
          format(item.date, "yyyy-MM-dd") ===
          format(
            subDays(range?.from || addDays(new Date(), index), -index),
            "yyyy-MM-dd"
          )
      )?.count || "0"
    ),
  }))

  return res
}

export const DashboardCharts = ({
  notFulfilledOrders,
  fulfilledOrders,
  reviewsToReply,
}: {
  notFulfilledOrders: number
  fulfilledOrders: number
  reviewsToReply: any[]
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const [filters, setFilters] = useState(["customers", "orders"])

  const unreadMessages = useUnreads()

  const from = (searchParams.get("from") ||
    format(addDays(new Date(), -7), "yyyy-MM-dd")) as unknown as Date
  const to = (searchParams.get("to") ||
    format(new Date(), "yyyy-MM-dd")) as unknown as Date

  const updateDateRange = async (newFrom: string, newTo: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("from", format(newFrom, "yyyy-MM-dd"))
    newSearchParams.set("to", format(newTo, "yyyy-MM-dd"))
    await setSearchParams(newSearchParams)
    refetch()
  }

  const { customers, orders, isPending, refetch } = useStatistics({
    from: `${from}`,
    to: `${to}`,
  })

  const chartData = generateChartData({
    range: { from, to },
    customers,
    orders,
  })

  const totals = chartData.reduce(
    (acc, curr) => {
      return {
        orders: acc.orders + curr.orders,
        customers: acc.customers + curr.customers,
      }
    },
    { orders: 0, customers: 0 }
  )

  const handleFilter = (label: string) => {
    if (filters.find((item) => item === label)) {
      setFilters(filters.filter((item) => item !== label))
    } else {
      setFilters([...filters, label])
    }
  }

  return (
    <>
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Actions</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Check out new events and manage your store
            </Text>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/orders?order_status=not_fulfilled">
            <Button
              variant="secondary"
              className="w-full justify-between py-4 h-full"
            >
              <div className="flex gap-4 items-center">
                <Badge>{notFulfilledOrders}</Badge>
                Orders to be fulfilled
              </div>
              <TriangleRightMini color="grey" />
            </Button>
          </Link>
          <Link to="/orders?order_status=fulfilled">
            <Button
              variant="secondary"
              className="w-full justify-between py-4 h-full"
            >
              <div className="flex gap-4 items-center">
                <Badge>{fulfilledOrders}</Badge>
                Orders to be shipped
              </div>
              <TriangleRightMini color="grey" />
            </Button>
          </Link>
          <Link to="/reviews?seller_note=false">
            <Button
              variant="secondary"
              className="w-full justify-between py-4 h-full"
            >
              <div className="flex gap-4 items-center">
                <Badge>{reviewsToReply}</Badge>
                Reviews to reply
              </div>
              <TriangleRightMini color="grey" />
            </Button>
          </Link>
          <Link to="/messages">
            <Button
              variant="secondary"
              className="w-full justify-between py-4 h-full h-full"
            >
              <div className="flex gap-4 items-center">
                <Badge>{unreadMessages?.length || 0}</Badge>Unread messages
              </div>
              <TriangleRightMini color="grey" />
            </Button>
          </Link>
        </div>
      </Container>
      <Container className="divide-y p-0 mt-2">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Analytics</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              See your store's progress
            </Text>
          </div>
          <div>
            <Popover>
              <Popover.Trigger asChild>
                <Button variant="secondary">
                  <CalendarMini />
                  {from ? (
                    to ? (
                      <>
                        {format(from, "LLL dd, y")} - {format(to, "LLL dd, y")}
                      </>
                    ) : (
                      format(from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </Popover.Trigger>
              <Popover.Content>
                <Calendar
                  mode="range"
                  selected={{ from, to }}
                  onSelect={(range) =>
                    range && updateDateRange(`${range.from}`, `${range.to}`)
                  }
                  numberOfMonths={2}
                  defaultMonth={from}
                />
              </Popover.Content>
            </Popover>
          </div>
        </div>
        <div className="relative px-6 py-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="col-span-3 relative h-[150px] md:h-[300px] w-[calc(100%-2rem)]">
            {isPending ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid stroke="#333" vertical={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {filters.map((item) => (
                    <Line
                      key={item}
                      type="monotone"
                      dataKey={item}
                      stroke={colorPicker(item)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:block gap-4">
            {isPending ? (
              <ChartSkeleton />
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="p-4 border rounded-lg w-full flex-col items-start my-2"
                  onClick={() => handleFilter("orders")}
                >
                  <Heading level="h3">Orders</Heading>
                  <div className="flex gap-2 items-center mt-2">
                    <div
                      className="h-8 w-1"
                      style={{
                        backgroundColor: filters.find(
                          (item) => item === "orders"
                        )
                          ? colorPicker("orders")
                          : "gray",
                      }}
                    />
                    <Text className="text-ui-fg-subtle">{totals.orders}</Text>
                  </div>
                </Button>
                <Button
                  variant="secondary"
                  className="p-4 border rounded-lg w-full flex-col items-start my-2"
                  onClick={() => handleFilter("customers")}
                >
                  <Heading level="h3">Customers</Heading>
                  <div className="flex gap-2 items-center mt-2">
                    <div
                      className="h-8 w-1"
                      style={{
                        backgroundColor: filters.find(
                          (item) => item === "customers"
                        )
                          ? colorPicker("customers")
                          : "gray",
                      }}
                    />
                    <Text className="text-ui-fg-subtle">
                      {totals.customers}
                    </Text>
                  </div>
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  )
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  label?: string
  payload?: {
    dataKey: string
    name: string
    stroke: string
    value: number
  }[]
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ui-bg-component p-4 rounded-lg border border-ui-border-base">
        <p className="font-bold">{`${label}`}</p>
        <ul>
          {payload.map((item) => (
            <li key={item.dataKey} className="flex gap-2 items-center">
              <span className="capitalize" style={{ color: item.stroke }}>
                {item.name}:
              </span>
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return null
}
