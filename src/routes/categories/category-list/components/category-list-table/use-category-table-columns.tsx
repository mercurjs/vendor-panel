import { DocumentText, TriangleRightMini } from "@medusajs/icons"
import { AdminProductCategoryResponse } from "@medusajs/types"
import { IconButton, Text, clx } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { StatusCell } from "../../../../../components/table/table-cells/common/status-cell"
import {
  TextCell,
  TextHeader,
} from "../../../../../components/table/table-cells/common/text-cell"
import {
  getCategoryPath,
  getIsActiveProps,
  getIsInternalProps,
} from "../../../common/utils"

const columnHelper =
  createColumnHelper<AdminProductCategoryResponse["product_category"]>()

function getCategoryThumbnailUrl(
  category: AdminProductCategoryResponse["product_category"]
): string | undefined {
  const detail = (category as Record<string, unknown>).category_detail as
    | { media?: { url?: string }[]; thumbnail?: { url?: string } }
    | undefined
  if (!detail) return undefined
  if (detail.thumbnail?.url) return detail.thumbnail.url
  const media = detail.media
  if (Array.isArray(media) && media[0]?.url) return media[0].url
  return undefined
}

export const useCategoryTableColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => <TextHeader text={t("fields.name")} />,
        cell: ({ getValue, row }) => {
          const expandHandler = row.getToggleExpandedHandler()
          const thumbnailUrl = getCategoryThumbnailUrl(row.original)

          if (row.original.parent_category !== undefined) {
            const path = getCategoryPath(row.original)

            return (
              <div className="flex size-full items-center gap-2 overflow-hidden">
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-component">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt=""
                      className="size-8 object-cover"
                    />
                  ) : (
                    <DocumentText className="text-ui-fg-muted size-5" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
                  {path.map((chip, index) => (
                    <div
                      key={chip.id}
                      className={clx("overflow-hidden", {
                        "text-ui-fg-muted flex items-center gap-x-1":
                          index !== path.length - 1,
                      })}
                    >
                      <Text size="small" leading="compact" className="truncate">
                        {chip.name}
                      </Text>
                      {index !== path.length - 1 && (
                        <Text size="small" leading="compact">
                          /
                        </Text>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          return (
            <div className="flex size-full items-center gap-x-3 overflow-hidden">
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ui-bg-component">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt=""
                    className="size-8 object-cover"
                  />
                ) : (
                  <DocumentText className="text-ui-fg-muted size-5" />
                )}
              </div>
              <div className="flex size-7 shrink-0 items-center justify-center">
                {row.getCanExpand() ? (
                  <IconButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()

                      expandHandler()
                    }}
                    size="small"
                    variant="transparent"
                    className="text-ui-fg-subtle"
                  >
                    <TriangleRightMini
                      className={clx({
                        "rotate-90 transition-transform will-change-transform":
                          row.getIsExpanded(),
                      })}
                    />
                  </IconButton>
                ) : null}
              </div>
              <span className="truncate">{getValue()}</span>
            </div>
          )
        },
      }),
      columnHelper.accessor("handle", {
        header: () => <TextHeader text={t("fields.handle")} />,
        cell: ({ getValue }) => {
          return <TextCell text={`/${getValue()}`} />
        },
      }),
      columnHelper.accessor("is_active", {
        header: () => <TextHeader text={t("fields.status")} />,
        cell: ({ getValue }) => {
          const { color, label } = getIsActiveProps(getValue(), t)
          return <StatusCell color={color}>{label}</StatusCell>
        },
      }),
      columnHelper.accessor("is_internal", {
        header: () => (
          <TextHeader text={t("categories.fields.visibility.label")} />
        ),
        cell: ({ getValue }) => {
          const { color, label } = getIsInternalProps(getValue(), t)
          return <StatusCell color={color}>{label}</StatusCell>
        },
      }),
    ],
    [t]
  )
}
