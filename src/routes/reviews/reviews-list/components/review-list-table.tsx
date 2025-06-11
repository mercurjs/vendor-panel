import { Container, Heading, Text } from "@medusajs/ui"
import { keepPreviousData } from "@tanstack/react-query"
import { useMemo } from "react"

import { useReviews } from "../../../../hooks/api/review"
import { _DataTable } from "../../../../components/table/data-table"
import { useDataTable } from "../../../../hooks/use-data-table"
import { useReviewTableColumns } from "../../../../hooks/table/columns/use-review-table-columns"
import { useReviewTableQuery } from "../../../../hooks/table/query/use-review-table-query"
import { StarsRating } from "../../../../components/common/stars-rating/stars-rating"
import { useSearchParams } from "react-router-dom"

const PAGE_SIZE = 20

export const ReviewListTable = () => {
  const { searchParams, raw } = useReviewTableQuery({
    pageSize: PAGE_SIZE,
  })

  const [params] = useSearchParams()
  const sellerNote = params.get("seller_note") === "false"

  const { reviews, isLoading, isError, error } = useReviews(
    {
      fields: "*customer",
      ...searchParams,
    },
    {
      placeholderData: keepPreviousData,
    }
  )

  const filtered = reviews?.filter((review: any) => review) || []
  const filteredReviews = sellerNote
    ? filtered.filter((review: any) => !review.seller_note)
    : filtered

  const count = filteredReviews.length

  const averageRating =
    count > 0
      ? Math.floor(
          filteredReviews.reduce(
            (sum: number, { rating }: { rating: number }) => sum + rating,
            0
          ) / count
        )
      : 0

  const columns = useColumns()

  const { table } = useDataTable({
    data: filteredReviews,
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
          <Heading>Reviews</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Manage your reviews
          </Text>
        </div>
        <div>
          <Text className="text-ui-fg-subtle mb-2">{count} reviews</Text>
          <StarsRating rate={averageRating} />
        </div>
      </div>
      <_DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        // orderBy={[
        //   {
        //     key: 'created_at',
        //     label: 'Added',
        //   },
        //   {
        //     key: 'seller_note',
        //     label: 'Status',
        //   },
        //   { key: 'rating', label: 'Stars' },
        // ]}
        isLoading={isLoading}
        navigateTo={(row) => row.original.id}
        // search
        queryObject={raw}
        noRecords={{
          message: "Your reviews will show up here.",
        }}
      />
    </Container>
  )
}

const useColumns = () => {
  const reviews = useReviewTableColumns()

  return useMemo(() => [...reviews], [reviews])
}
