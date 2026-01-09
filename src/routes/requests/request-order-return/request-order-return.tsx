import { useNavigate, useParams } from "react-router-dom"
import {
  useOrderReturnRequest,
  useUpdateOrderReturnRequest,
} from '../../../hooks/api'
import { RouteDrawer } from "../../../components/modals"
import { Button, Select, Textarea, toast } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { Form } from "../../../components/common/form"
import { useStockLocations } from "../../../hooks/api"
import { useEffect } from "react"

const STATUS_OPTIONS = ["refunded", "escalated"]

export function RequestOrderReturn() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { order_return_request, isLoading } = useOrderReturnRequest(id!)

  const { stock_locations, isLoading: isStockLocationsLoading } =
    useStockLocations()

  const form = useForm({
    defaultValues: {
      status: order_return_request?.status || STATUS_OPTIONS[0],
      vendor_reviewer_note: order_return_request?.vendor_reviewer_note || "",
      location_id: undefined,
    },
  })

  useEffect(() => {
    if (order_return_request) {
      form.reset({
        status: order_return_request.status || STATUS_OPTIONS[0],
        vendor_reviewer_note: order_return_request.vendor_reviewer_note || "",
        location_id: undefined,
      })
    }
  }, [order_return_request, form])

  const { mutate: updateOrderReturnRequest } = useUpdateOrderReturnRequest(id!)

  const handleUpdateOrderReturnRequest = async (payload: any) => {
    updateOrderReturnRequest(payload, {
      onSuccess: () => {
        navigate("/requests/orders", { replace: true })
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }

  if (isLoading || isStockLocationsLoading) {
    return <div>Loading...</div>
  }

  return (
    <RouteDrawer prev="/requests/orders">
      <RouteDrawer.Header>
        <RouteDrawer.Title>
          Request Return Order #{order_return_request.order.display_id}
        </RouteDrawer.Title>
      </RouteDrawer.Header>
      <RouteDrawer.Body>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateOrderReturnRequest)}>
            <Form.Field
              control={form.control}
              name="status"
              render={({ field: { onChange, value, ...field } }) => {
                return (
                  <Form.Item>
                    <Form.Label>Status</Form.Label>
                    <Form.Control>
                      <Select
                        {...field}
                        value={value}
                        onValueChange={onChange}
                      >
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          {STATUS_OPTIONS.map((reason, index) => (
                            <Select.Item
                              key={`select-option-${index}`}
                              value={reason}
                            >
                              {reason}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            {form.watch("status") === "refunded" &&
              (stock_locations || []).length > 0 && (
                <Form.Field
                  control={form.control}
                  name="location_id"
                  render={({ field: { onChange, value, ...field } }) => (
                    <Form.Item className="mt-4">
                      <Form.Label>Location</Form.Label>
                      <Form.Control>
                        <Select {...field} onValueChange={onChange}>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            {stock_locations?.map((sl, index) => (
                              <Select.Item
                                key={`select-sl-${index}`}
                                value={sl.id}
                              >
                                {sl.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              )}
            <Form.Field
              control={form.control}
              name="vendor_reviewer_note"
              render={({ field }) => {
                return (
                  <Form.Item className="mt-4">
                    <Form.Label>Vendor Reviewer Note</Form.Label>
                    <Form.Control>
                      <Textarea {...field} rows={4} />
                    </Form.Control>
                  </Form.Item>
                )
              }}
            />
            <div className="flex justify-end mt-8">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </RouteDrawer.Body>
    </RouteDrawer>
  )
}
