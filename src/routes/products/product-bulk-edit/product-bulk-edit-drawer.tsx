import { zodResolver } from "@hookform/resolvers/zod"
import { Button, FocusModal, toast } from "@medusajs/ui"
import { useRef, useState } from "react"
import { DefaultValues, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { DataGrid } from "../../../components/data-grid"
import { KeyboundForm } from "../../../components/utilities/keybound-form"
import {
  BatchUpdateProductItem,
  useBatchUpdateProducts,
} from "../../../hooks/api/products"
import { ExtendedAdminProduct } from "../../../types/products"
import { useProductBulkEditColumns } from "./hooks/use-product-bulk-edit-columns"
import {
  ProductBulkEditItemSchema,
  ProductBulkEditSchema,
} from "./schema"

type ProductBulkEditDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: ExtendedAdminProduct[]
}

export const ProductBulkEditDrawer = ({
  open,
  onOpenChange,
  products,
}: ProductBulkEditDrawerProps) => {
  const { t } = useTranslation()

  return (
    <FocusModal open={open} onOpenChange={onOpenChange}>
      <FocusModal.Content>
        <FocusModal.Title asChild>
          <span className="sr-only">{t("products.bulkEdit.title")}</span>
        </FocusModal.Title>
        <FocusModal.Description asChild>
          <span className="sr-only">{t("products.bulkEdit.description")}</span>
        </FocusModal.Description>
        {products.length > 0 && (
          <ProductBulkEditForm
            products={products}
            onClose={() => onOpenChange(false)}
          />
        )}
      </FocusModal.Content>
    </FocusModal>
  )
}

type ProductBulkEditFormProps = {
  products: ExtendedAdminProduct[]
  onClose: () => void
}

const ProductBulkEditForm = ({ products, onClose }: ProductBulkEditFormProps) => {
  const { t } = useTranslation()
  const [closeOnEscape, setCloseOnEscape] = useState(true)

  const initialValues = useRef(getDefaultValues(products))

  const form = useForm<ProductBulkEditSchema>({
    defaultValues: getDefaultValues(products),
    resolver: zodResolver(ProductBulkEditSchema),
  })

  const columns = useProductBulkEditColumns()

  const { mutateAsync, isPending } = useBatchUpdateProducts()

  const onSubmit = form.handleSubmit(async (data) => {
    const updates: BatchUpdateProductItem[] = []

    for (const [productId, item] of Object.entries(data.products)) {
      const original = initialValues.current?.products?.[productId]

      if (!original) continue

      const changes: BatchUpdateProductItem = { id: productId }
      let hasChanges = false

      if (item.title !== original.title) {
        changes.title = item.title
        hasChanges = true
      }

      if (item.status !== original.status) {
        changes.status = item.status
        hasChanges = true
      }

      if (item.discountable !== original.discountable) {
        changes.discountable = item.discountable
        hasChanges = true
      }

      if (hasChanges) {
        updates.push(changes)
      }
    }

    if (updates.length === 0) {
      toast.info(t("products.bulkEdit.noChanges"))
      return
    }

    await mutateAsync(
      { update: updates },
      {
        onSuccess: () => {
          toast.success(t("products.bulkEdit.success"))
          onClose()
        },
        onError: (error) => {
          toast.error(error.message)
        },
      }
    )
  })

  return (
    <KeyboundForm onSubmit={onSubmit} className="flex size-full flex-col">
      <FocusModal.Header />
      <FocusModal.Body className="size-full flex-1 overflow-y-auto">
        <DataGrid
          columns={columns}
          data={products}
          state={form}
          onEditingChange={(editing) => {
            setCloseOnEscape(!editing)
          }}
        />
      </FocusModal.Body>
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <FocusModal.Close asChild>
          <Button variant="secondary" size="small" type="button">
            {t("actions.cancel")}
          </Button>
        </FocusModal.Close>
        <Button type="submit" size="small" isLoading={isPending}>
          {t("actions.save")}
        </Button>
      </div>
    </KeyboundForm>
  )
}

function getDefaultValues(
  products: ExtendedAdminProduct[]
): DefaultValues<ProductBulkEditSchema> {
  return {
    products: products.reduce(
      (acc, product) => {
        acc[product.id] = {
          title: product.title || "",
          status: product.status as "draft" | "published",
          discountable: product.discountable ?? true,
        }
        return acc
      },
      {} as Record<string, ProductBulkEditItemSchema>
    ),
  }
}
