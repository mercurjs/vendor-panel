import { PencilSquare, Trash } from "@medusajs/icons"
import { Button, Container, Heading, toast, usePrompt } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Link,
  Outlet,
  useLoaderData,
  // useLocation,
} from "react-router-dom"

import { HttpTypes } from "@medusajs/types"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { _DataTable } from "../../../../../components/table/data-table"
import {
  useDeleteProduct,
  useProducts,
} from "../../../../../hooks/api/products"
import { useProductTableColumns } from "../../../../../hooks/table/columns/use-product-table-columns"
import { useProductTableFilters } from "../../../../../hooks/table/filters/use-product-table-filters"
import { useProductTableQuery } from "../../../../../hooks/table/query/use-product-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { productsLoader } from "../../loader"

export const PAGE_SIZE = 5

export const ProductListTable = () => {
  const { t } = useTranslation()

  const initialData = useLoaderData() as Awaited<
    ReturnType<ReturnType<typeof productsLoader>>
  >

  const { searchParams, raw } = useProductTableQuery({
    pageSize: PAGE_SIZE,
  })
  const { products, count, isLoading, isError, error } = useProducts(
    {
      limit: searchParams.limit,
      offset: searchParams.offset,
      fields: "+thumbnail,*categories,+status",
    },
    {
      initialData,
      placeholderData: keepPreviousData,
    },
    {
      collectionId: searchParams.collection_id,
      categoryId: searchParams.category_id,
      typeId: searchParams.type_id,
      tagId: searchParams.tagId,
      status: searchParams.status,
      q: searchParams.q,
      sort: searchParams.order,
    }
  )

  const offset = searchParams.offset || 0

  const processedProducts = (products as HttpTypes.AdminProduct[])?.slice(
    offset,
    offset + PAGE_SIZE
  )
  const processedCount =
    count < (products?.length || 0) ? count : products?.length || 0

  const filters = useProductTableFilters()
  const columns = useColumns()

  const { table } = useDataTable({
    data: processedProducts,
    columns,
    count: processedCount,
    enablePagination: true,
    pageSize: PAGE_SIZE,
    getRowId: (row) => row?.id || "",
  })

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("products.domain")}</Heading>
        <div className="flex items-center justify-center gap-x-2">
          <Button size="small" variant="secondary" asChild>
            <Link to={`export${location.search}`}>{t("actions.export")}</Link>
          </Button>
          <Button size="small" variant="secondary" asChild>
            <Link to="import">{t("actions.import")}</Link>
          </Button>
          <Button size="small" variant="secondary" asChild>
            <Link to="create">{t("actions.create")}</Link>
          </Button>
        </div>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        count={processedCount}
        pageSize={PAGE_SIZE}
        filters={filters}
        search
        pagination
        isLoading={isLoading}
        queryObject={raw}
        navigateTo={(row) => `${row.original.id}`}
        orderBy={[
          { key: "title", label: t("fields.title") },
          {
            key: "created_at",
            label: t("fields.createdAt"),
          },
          {
            key: "updated_at",
            label: t("fields.updatedAt"),
          },
        ]}
        noRecords={{
          message: t("products.list.noRecordsMessage"),
        }}
      />
      <Outlet />
    </Container>
  )
}

const ProductActions = ({ product }: { product: HttpTypes.AdminProduct }) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { mutateAsync } = useDeleteProduct(product.id)

  const handleDelete = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("products.deleteWarning", {
        title: product.title,
      }),
      confirmText: t("actions.delete"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync(undefined, {
      onSuccess: () => {
        toast.success(t("products.toasts.delete.success.header"), {
          description: t("products.toasts.delete.success.description", {
            title: product.title,
          }),
        })
      },
      onError: (e) => {
        toast.error(t("products.toasts.delete.error.header"), {
          description: e.message,
        })
      },
    })
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              to: `/products/${product.id}/edit`,
            },
          ],
        },
        {
          actions: [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: handleDelete,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>()

const useColumns = () => {
  const base = useProductTableColumns()

  const columns = useMemo(
    () => [
      ...base,
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => {
          return <ProductActions product={row.original} />
        },
      }),
    ],
    [base]
  )

  return columns
}
