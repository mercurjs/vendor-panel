import { PencilSquare, Trash } from "@medusajs/icons"
import {
  Container,
  createDataTableColumnHelper,
  toast,
  usePrompt,
} from "@medusajs/ui"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import { DataTable } from "../../../../../components/data-table"
import { useDataTableDateFilters } from "../../../../../components/data-table/helpers/general/use-data-table-date-filters"
import { SingleColumnPage } from "../../../../../components/layout/pages"
import { useDashboardExtension } from "../../../../../extensions"
import {
  useCustomerGroups,
  useDeleteCustomerGroupLazy,
} from "../../../../../hooks/api"
import { useDate } from "../../../../../hooks/use-date"
import { TextCell } from "../../../../../components/table/table-cells/common/text-cell"
import { CustomerGroupData } from "../../../../orders/common/customerGroupFiltering"

const PAGE_SIZE = 10

export const CustomerGroupListTable = () => {
  const { t } = useTranslation()
  const { getWidgets } = useDashboardExtension()

  const columns = useColumns()
  const filters = useFilters()

  const { customer_groups, isPending, isError, error } = useCustomerGroups()

  if (isError) {
    throw error
  }

  const filteredList = customer_groups?.filter((group) => group.customer_group)

  const count = filteredList?.length || 0

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("customer_group.list.before"),
        after: getWidgets("customer_group.list.after"),
      }}
    >
      <Container className="overflow-hidden p-0">
        <DataTable
          data={filteredList}
          columns={columns}
          filters={filters}
          heading={t("customerGroups.domain")}
          subHeading="Organize customers into groups. Groups can have different promotions and prices."
          rowCount={count}
          getRowId={(row) => row.customer_group_id}
          rowHref={(row: any) => `/customer-groups/${row.original.customer_group_id}`
          }
          action={{
            label: t("actions.create"),
            to: "/customer-groups/create",
          }}
          emptyState={{
            empty: {
              heading: t("customerGroups.list.empty.heading"),
              description: t("customerGroups.list.empty.description"),
            },
            filtered: {
              heading: t("customerGroups.list.filtered.heading"),
              description: t("customerGroups.list.filtered.description"),
            },
          }}
          pageSize={PAGE_SIZE}
          isLoading={isPending}
        />
      </Container>
    </SingleColumnPage>
  )
}

const columnHelper = createDataTableColumnHelper<CustomerGroupData>()

const useColumns = () => {
  const { t } = useTranslation()
  const { getFullDate } = useDate()
  const navigate = useNavigate()
  const prompt = usePrompt()

  const { mutateAsync: deleteCustomerGroup } = useDeleteCustomerGroupLazy()

  const handleDeleteCustomerGroup = useCallback(
    async ({ id, name }: { id: string; name: string }) => {
      const res = await prompt({
        title: t("customerGroups.delete.title"),
        description: t("customerGroups.delete.description", {
          name,
        }),
        verificationText: name,
        verificationInstruction: t("general.typeToConfirm"),
        confirmText: t("actions.delete"),
        cancelText: t("actions.cancel"),
      })

      if (!res) {
        return
      }

      await deleteCustomerGroup(
        { id },
        {
          onSuccess: () => {
            toast.success(
              t("customerGroups.delete.successToast", {
                name,
              })
            )
          },
          onError: (e) => {
            toast.error(e.message)
          },
        }
      )
    },
    [t, prompt, deleteCustomerGroup]
  )

  return useMemo(() => {
    return [
      columnHelper.accessor("customer_group.name", {
        header: t("fields.name"),
        enableSorting: true,
        sortAscLabel: t("filters.sorting.alphabeticallyAsc"),
        sortDescLabel: t("filters.sorting.alphabeticallyDesc"),
        cell: ({ row }) => {
          return <TextCell text={row?.original?.customer_group?.name || "-"} />
        },
      }),
      columnHelper.accessor("customer_group.customers", {
        header: t("customers.domain"),
        cell: ({ row }) => {
          return (
            <span>{row?.original?.customer_group?.customers?.length ?? 0}</span>
          )
        },
      }),
      columnHelper.action({
        actions: [
          [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              onClick: ({ row }) => {
                navigate(
                  `/customer-groups/${row.original.customer_group_id}/edit`
                )
              },
            },
          ],
          [
            {
              icon: <Trash />,
              label: t("actions.delete"),
              onClick: ({ row }) => {
                handleDeleteCustomerGroup({
                  id: row.original.customer_group_id,
                  name: row.original.customer_group.name ?? "",
                })
              },
            },
          ],
        ],
      }),
    ]
  }, [t, navigate, getFullDate, handleDeleteCustomerGroup])
}

const useFilters = () => {
  const dateFilters = useDataTableDateFilters()

  return useMemo(() => {
    return dateFilters
  }, [dateFilters])
}
