import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { _DataTable } from "../../../../../components/table/data-table"
import { useApiKeys } from "../../../../../hooks/api/api-keys"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useApiKeyManagementTableColumns } from "./use-api-key-management-table-columns"
import { useApiKeyManagementTableFilters } from "./use-api-key-management-table-filters"
import { useApiKeyManagementTableQuery } from "./use-api-key-management-table-query"

const PAGE_SIZE = 20

export const ApiKeyManagementListTable = ({
  keyType,
}: {
  keyType: "secret" | "publishable"
}) => {
  const { t } = useTranslation()

  const { searchParams, raw } = useApiKeyManagementTableQuery({
    pageSize: PAGE_SIZE,
  })

  const query = {
    ...searchParams,
    type: keyType,
    fields:
      "id,title,redacted,token,type,created_at,updated_at,revoked_at,last_used_at,created_by,revoked_by",
  }

  const { api_keys, isLoading, isError, error } = useApiKeys(query)

  const filteredApiKeys = api_keys?.filter((key) => !key.revoked_at)

  const count = filteredApiKeys?.length ?? 0

  const filters = useApiKeyManagementTableFilters()
  const columns = useApiKeyManagementTableColumns()

  const { table } = useDataTable({
    data: filteredApiKeys ?? [],
    columns,
    count,
    enablePagination: true,
    getRowId: (row) => row.id,
    pageSize: PAGE_SIZE,
  })

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">
            {keyType === "publishable"
              ? t(`apiKeyManagement.domain.publishable`)
              : t("apiKeyManagement.domain.secret")}
          </Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {keyType === "publishable"
              ? t(`apiKeyManagement.subtitle.publishable`)
              : t("apiKeyManagement.subtitle.secret")}
          </Text>
        </div>
        <Link to="create">
          <Button variant="secondary" size="small">
            {t("actions.create")}
          </Button>
        </Link>
      </div>
      <_DataTable
        table={table}
        filters={filters}
        columns={columns}
        count={count}
        pageSize={PAGE_SIZE}
        navigateTo={(row) => row.id}
        pagination
        queryObject={raw}
        isLoading={isLoading}
      />
    </Container>
  )
}
