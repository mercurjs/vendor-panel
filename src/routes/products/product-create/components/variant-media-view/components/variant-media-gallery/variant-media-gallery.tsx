import {
    ThumbnailBadge,
    TriangleLeftMini,
    TriangleRightMini,
} from "@medusajs/icons"
import { Button, IconButton, Text, Tooltip, clx } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { VariantMediaViewContext } from "../../variant-media-view-context"

type VariantMediaGalleryProps = {
    variantId: string
    variantTitle?: string
    goToEdit: () => void
}

export const VariantMediaGallery = ({ variantId, variantTitle, goToEdit }: VariantMediaGalleryProps) => {
    const [curr, setCurr] = useState<number>(0)
    const { t } = useTranslation()

    // For new variants during product creation, there won't be any media yet
    const media: any[] = []

    const next = useCallback(() => {
        setCurr((prev) => (prev + 1) % media.length)
    }, [media.length])

    const prev = useCallback(() => {
        setCurr((prev) => (prev - 1 + media.length) % media.length)
    }, [media.length])

    const goTo = useCallback(
        (index: number) => {
            if (index < 0 || index >= media.length) {
                return
            }

            setCurr(index)
        },
        [media.length]
    )

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") {
                next()
            } else if (e.key === "ArrowLeft") {
                prev()
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [next, prev])

    const noMedia = !media.length

    return (
        <VariantMediaViewContext.Consumer>
            {(value) => (
                <div className="flex size-full flex-col bg-ui-bg-subtle">

                    {noMedia ? (
                        <div className="bg-ui-bg-subtle flex size-full flex-col items-center justify-center gap-y-4 pb-8 pt-6">
                            <div className="flex flex-col items-center">
                                <Text
                                    size="small"
                                    leading="compact"
                                    weight="plus"
                                    className="text-ui-fg-subtle"
                                >
                                    {t("products.media.emptyState.header")}
                                </Text>
                                <Text size="small" className="text-ui-fg-muted">
                                    {t("products.media.emptyState.description")}
                                </Text>
                            </div>
                            <Button size="small" variant="secondary" onClick={goToEdit}>
                                {t("products.media.emptyState.action")}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Canvas curr={curr} media={media} />
                            <Preview
                                curr={curr}
                                media={media}
                                prev={prev}
                                next={next}
                                goTo={goTo}
                            />
                        </>
                    )}
                </div>
            )}
        </VariantMediaViewContext.Consumer>
    )
}

const Canvas = ({ media, curr }: { media: Media[]; curr: number }) => {
    const { t } = useTranslation()

    return (
        <div className="bg-ui-bg-subtle relative size-full overflow-hidden">
            <div className="flex size-full items-center justify-center p-6">
                <div className="relative inline-block max-h-full max-w-full">
                    {media[curr].isThumbnail && (
                        <div className="absolute left-2 top-2">
                            <Tooltip content={t("products.media.thumbnailTooltip")}>
                                <ThumbnailBadge />
                            </Tooltip>
                        </div>
                    )}
                    <img
                        src={media[curr].url}
                        alt=""
                        className="object-fit shadow-elevation-card-rest max-h-[calc(100vh-200px)] w-auto rounded-xl object-contain"
                    />
                </div>
            </div>
        </div>
    )
}

const MAX_VISIBLE_ITEMS = 8

const Preview = ({
    media,
    curr,
    prev,
    next,
    goTo,
}: {
    media: Media[]
    curr: number
    prev: () => void
    next: () => void
    goTo: (index: number) => void
}) => {
    if (!media.length) {
        return null
    }

    const getVisibleItems = (media: Media[], index: number) => {
        if (media.length <= MAX_VISIBLE_ITEMS) {
            return media
        }

        const half = Math.floor(MAX_VISIBLE_ITEMS / 2)
        const start = (index - half + media.length) % media.length
        const end = (start + MAX_VISIBLE_ITEMS) % media.length

        if (end < start) {
            return [...media.slice(start), ...media.slice(0, end)]
        } else {
            return media.slice(start, end)
        }
    }

    const visibleItems = getVisibleItems(media, curr)

    return (
        <div className="flex shrink-0 items-center justify-center gap-x-2 border-t p-3">
            <IconButton
                size="small"
                variant="transparent"
                className="text-ui-fg-muted"
                type="button"
                onClick={prev}
            >
                <TriangleLeftMini />
            </IconButton>
            <div className="flex items-center gap-x-2">
                {visibleItems.map((item) => {
                    const isCurrentImage = item.id === media[curr].id
                    const originalIndex = media.findIndex((i) => i.id === item.id)

                    return (
                        <button
                            type="button"
                            onClick={() => goTo(originalIndex)}
                            className={clx(
                                "transition-fg size-7 overflow-hidden rounded-[4px] outline-none",
                                {
                                    "shadow-borders-focus": isCurrentImage,
                                }
                            )}
                            key={item.id}
                        >
                            <img src={item.url} alt="" className="size-full object-cover" />
                        </button>
                    )
                })}
            </div>
            <IconButton
                size="small"
                variant="transparent"
                className="text-ui-fg-muted"
                type="button"
                onClick={next}
            >
                <TriangleRightMini />
            </IconButton>
        </div>
    )
}

type Media = {
    id: string
    url: string
    isThumbnail: boolean
}

const getMedia = (
    images: HttpTypes.AdminProductImage[] | null,
    thumbnail: string | null
) => {
    const media: Media[] =
        images?.map((image) => ({
            id: image.id,
            url: image.url,
            isThumbnail: image.url === thumbnail,
        })) || []

    if (thumbnail && !media.some((mediaItem) => mediaItem.isThumbnail)) {
        media.unshift({
            id: "thumbnail_only",
            url: thumbnail,
            isThumbnail: true,
        })
    }

    return media
}
