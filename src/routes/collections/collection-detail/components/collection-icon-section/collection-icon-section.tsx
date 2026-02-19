import { HttpTypes } from "@medusajs/types"
import { Container, Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"

type CollectionIconSectionProps = {
  collection: HttpTypes.AdminCollection & {
    collection_detail?: {
      icon_id?: string | null
      media?: Array<{ id: string; url: string }>
    }
  }
}

function StarIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ui-fg-base"
      aria-hidden
    >
      <path d="M32 8 L36 24 L52 24 L40 34 L44 50 L32 42 L20 50 L24 34 L12 24 L28 24 Z" />
    </svg>
  )
}

export const CollectionIconSection = ({
  collection,
}: CollectionIconSectionProps) => {
  const { t } = useTranslation()

  const iconUrl =
    collection.collection_detail?.icon_id &&
    collection.collection_detail?.media?.find(
      (m) => m.id === collection.collection_detail?.icon_id
    )?.url

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">{t("collections.icon.label")}</Heading>
      </div>
      <div className="flex items-center px-6 py-4">
        <div className="bg-ui-bg-subtle flex aspect-square size-24 items-center justify-center overflow-hidden rounded-lg">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <StarIcon />
          )}
        </div>
      </div>
    </Container>
  )
}
