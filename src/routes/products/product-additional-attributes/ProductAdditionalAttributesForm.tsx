"use client"

import { Button, Heading, toast, Tooltip } from "@medusajs/ui"
import { RouteDrawer } from "../../../components/modals"
import {
  useProduct,
  useProductAttributes,
  useUpdateProduct,
} from "../../../hooks/api/products"
import { ProductAttribute } from "../../../types/products"
import { useParams } from "react-router-dom"
import { Components } from "./components/Components"
import { useForm } from "react-hook-form"
import { Form } from "../../../components/common/form"
import { useNavigate } from "react-router-dom"
import { InformationCircleSolid } from "@medusajs/icons"

export const ProductAdditionalAttributesForm = () => {
  const { id } = useParams()
  const { product, isLoading: isProductLoading } = useProduct(id!)

  const { attributes, isLoading: isAttributesLoading } = useProductAttributes(
    id!
  )

  // @ts-ignore
  const defaultValues = product?.attribute_values?.reduce(
    (acc: any, curr: any) => {
      acc[curr.attribute_id] = curr.value
      return acc
    },
    {}
  )

  const form = useForm({
    defaultValues,
  })
  const navigate = useNavigate()

  const { mutate: updateProduct } = useUpdateProduct(id!)

  if (isAttributesLoading || isProductLoading) return <div>Loading...</div>

  const onSubmit = async (data: any) => {
    const values = Object.keys(data).reduce(
      (acc: Array<Record<string, string>>, key) => {
        acc.push({ attribute_id: key, value: data[key] })
        return acc
      },
      []
    )

    await updateProduct(
      {
        // @ts-ignore
        additional_data: { values },
      },
      {
        onSuccess: () => {
          toast.success("Product updated successfully")
          navigate(`/products/${id}`)
        },
      }
    )
  }

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading level="h2">Additional Attributes</Heading>
      </RouteDrawer.Header>
      <RouteDrawer.Body className="max-h-[calc(86vh)] overflow-y-auto py-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {attributes?.map((a: ProductAttribute) => (
              <Form.Field
                key={`form-field-${a.handle}-${a.id}`}
                control={form.control}
                name={a.id}
                render={({ field }) => {
                  return (
                    <Form.Item key={a.id} className="w-full mb-4">
                      <Form.Label className="flex flex-col gap-y-2 w-full">
                        <span className="flex items-center gap-x-2">
                          {a.name}
                          {a.description && (
                            <Tooltip content={a.description}>
                              <InformationCircleSolid />
                            </Tooltip>
                          )}
                        </span>

                        <Form.Control>
                          <Components attribute={a} field={field} />
                        </Form.Control>
                      </Form.Label>
                    </Form.Item>
                  )
                }}
              />
            ))}
            <div className="flex justify-end mt-4">
              <Button>Save</Button>
            </div>
          </form>
        </Form>
      </RouteDrawer.Body>
    </RouteDrawer>
  )
}
