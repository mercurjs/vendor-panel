import { HttpTypes } from "@medusajs/types"
import { ThumbnailBadge } from "@medusajs/icons"
import { Container, Heading, Tooltip } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

type CollectionMediaSectionProps = {
  collection: HttpTypes.AdminCollection & {
    collection_detail?: {
      thumbnail_id?: string | null
      banner_id?: string | null
      media?: Array<{ id: string; url: string }>
    }
  }
}

export const CollectionMediaSection = ({
  collection,
}: CollectionMediaSectionProps) => {
  const { t } = useTranslation()

  const media = collection.collection_detail?.media ?? []
  const thumbnailId = collection.collection_detail?.thumbnail_id
  const bannerId = collection.collection_detail?.banner_id

  if (media.length === 0) {
    return null
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">{t("collections.media.label")}</Heading>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 px-6 py-4">
        {media.map((item) => {
          const isThumbnail = item.id === thumbnailId
          const isBanner = item.id === bannerId

          return (
            <div
              key={item.id}
              className="group relative aspect-square size-full overflow-hidden rounded-[8px] shadow-elevation-card-rest"
            >
              {(isThumbnail || isBanner) && (
                <div className="absolute left-2 top-2 flex gap-x-1">
                  {isThumbnail && (
                    <Tooltip content={t("fields.thumbnail")}>
                      <ThumbnailBadge />
                    </Tooltip>
                  )}
                  {isBanner && (
                    <Tooltip content={t("collections.media.banner")}>
                      <div
                        className="bg-ui-tag-blue-bg text-ui-tag-blue-text flex size-6 items-center justify-center rounded"
                        aria-hidden
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                        >
                          <rect
                            x="2"
                            y="4"
                            width="12"
                            height="8"
                            rx="1"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                    </Tooltip>
                  )}
                </div>
              )}
              <img
                src={item.url}
                alt=""
                className="size-full object-cover"
              />
            </div>
          )
        })}
      </div>
    </Container>
  )
}
