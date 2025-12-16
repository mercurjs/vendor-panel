import {
    defaultDropAnimationSideEffects,
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    DropAnimation,
    KeyboardSensor,
    PointerSensor,
    UniqueIdentifier,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    arrayMove,
    rectSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { Fragment, useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { MediaSchema } from "../../constants"
import { UploadMediaFormItem } from "../../../common/components/upload-media-form-item/upload-media-form-item"
import { VariantMediaViewContext } from "../variant-media-view/variant-media-view-context"
import { CommandBar, Text } from "@medusajs/ui"
import { clx } from "@medusajs/ui"
import { MediaGridItem, MediaGridItemOverlay } from "../../../product-media/components/edit-product-media-form/edit-product-media-form"


const EditVariantMediaSchema = z.object({
    media: z.array(MediaSchema).min(0),
})

type EditVariantMediaSchemaType = z.infer<typeof EditVariantMediaSchema>

// Get default values - combine product media and variant-specific media
// All media items are available for selection, but only variant-specific media starts as selected
const getDefaultValues = (initialMedia?: any[], productMedia?: any[]) => {
    // Show all available media (product + variant-specific)
    // Initially, only variant-specific media is in the form (selected)
    // Product media can be added by selecting it
    const variantMedia = initialMedia || []
    return { media: variantMedia }
}

type EditVariantMediaFormProps = {
    variantIndex: number
    variantTitle?: string
    onSubmit?: () => void
    onCancel?: () => void
    onSaveMedia?: (variantIndex: number, media: any[]) => void
    initialMedia?: any[]
    productMedia?: any[]
}

export const EditVariantMediaForm = ({ variantIndex, onSubmit, onCancel, onSaveMedia, initialMedia = [], productMedia = [] }: EditVariantMediaFormProps) => {
    const [selection, setSelection] = useState<Record<string, true>>({})
    const { t } = useTranslation()

    const form = useForm<EditVariantMediaSchemaType>({
        defaultValues: getDefaultValues(initialMedia, productMedia),
        resolver: zodResolver(EditVariantMediaSchema),
    })

    const { fields, append, remove, update } = useFieldArray({
        name: "media",
        control: form.control,
        keyName: "field_id",
    })
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null)
        const { active, over } = event

        if (active.id !== over?.id) {
            const oldIndex = fields.findIndex((item) => item.field_id === active.id)
            const newIndex = fields.findIndex((item) => item.field_id === over?.id)

            form.setValue("media", arrayMove(fields, oldIndex, newIndex), {
                shouldDirty: true,
                shouldTouch: true,
            })
        }
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }


    // Submit handler - saves all selected media to parent form
    // Save all media items that are in the form (both product and variant-specific)
    const handleSubmit = form.handleSubmit(async ({ media }) => {
        if (onSaveMedia) {
            // Save all media items in the form - these are the ones selected for this variant
            // This includes both product media that was added and variant-specific media
            onSaveMedia(variantIndex, media || [])
        }
        onSubmit?.()
    })

    const handleCheckedChange = useCallback(
        (id: string) => {
            return (val: boolean) => {
                if (!val) {
                    const { [id]: _, ...rest } = selection
                    setSelection(rest)
                } else {
                    setSelection((prev) => ({ ...prev, [id]: true }))
                }
            }
        },
        [selection]
    )

    const handleDelete = () => {
        const ids = Object.keys(selection)
        const indices = ids.map((id) => fields.findIndex((m) => m.id === id))

        remove(indices)
        setSelection({})
    }

    const handlePromoteToThumbnail = () => {
        const ids = Object.keys(selection)

        if (!ids.length) {
            return
        }

        const currentThumbnailIndex = fields.findIndex((m) => m.isThumbnail)

        if (currentThumbnailIndex > -1) {
            update(currentThumbnailIndex, {
                ...fields[currentThumbnailIndex],
                isThumbnail: false,
            })
        }

        const index = fields.findIndex((m) => m.id === ids[0])

        update(index, {
            ...fields[index],
            isThumbnail: true,
        })

        setSelection({})
    }

    const selectionCount = Object.keys(selection).length


    return (
        <FormProvider {...form}>
            <VariantMediaViewContext.Consumer>
                {(value) => {
                    // Update context with handlers
                    if (value) {
                        value.onSubmit = handleSubmit
                        value.onCancel = () => value.onClose?.() || value.goToGallery()
                    }

                    return (
                        <div className="flex size-full flex-col overflow-hidden">
                            <div className="flex size-full flex-col-reverse lg:grid lg:grid-cols-[1fr_560px]">
                                <DndContext
                                    sensors={sensors}
                                    onDragEnd={handleDragEnd}
                                    onDragStart={handleDragStart}
                                    onDragCancel={handleDragCancel}
                                >
                                    <div className="bg-ui-bg-subtle size-full overflow-auto">
                                        <div className="grid h-fit auto-rows-auto grid-cols-4 gap-6 p-6">
                                            <SortableContext
                                                items={fields.map((m) => m.field_id)}
                                                strategy={rectSortingStrategy}
                                            >
                                                {fields.map((m) => {
                                                    return (
                                                        <MediaGridItem
                                                            onCheckedChange={handleCheckedChange(m.id!)}
                                                            checked={!!selection[m.id!]}
                                                            key={m.field_id}
                                                            media={m}
                                                        />
                                                    )
                                                })}
                                            </SortableContext>
                                            <DragOverlay dropAnimation={dropAnimationConfig}>
                                                {activeId ? (
                                                    <MediaGridItemOverlay
                                                        media={fields.find((m) => m.field_id === activeId)!}
                                                        checked={
                                                            !!selection[
                                                            fields.find((m) => m.field_id === activeId)!.id!
                                                            ]
                                                        }
                                                    />
                                                ) : null}
                                            </DragOverlay>
                                        </div>
                                    </div>
                                </DndContext>
                                <div className="bg-ui-bg-base overflow-auto border-b px-6 py-4 lg:border-b-0 lg:border-l flex flex-col gap-y-4">
                                    <UploadMediaFormItem form={form} append={append} />
                                    {productMedia && productMedia.length > 0 && (
                                        <div className="flex flex-col gap-y-2">
                                            <Text size="small" weight="plus" className="text-ui-fg-subtle">
                                                {t("products.media.label")} ({t("products.create.tabs.details")})
                                            </Text>
                                            <Text size="xsmall" className="text-ui-fg-muted">
                                                Click to add to variant
                                            </Text>
                                            <div className="grid grid-cols-2 gap-2">
                                                {productMedia.map((pm: any, idx: number) => {
                                                    const isAlreadyAdded = fields.some((f: any) => 
                                                        (f.id && f.id === pm.id) || 
                                                        (f.url && f.url === pm.url)
                                                    )
                                                    return (
                                                        <div
                                                            key={pm.id || `product-${idx}`}
                                                            className={clx(
                                                                "relative aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all",
                                                                {
                                                                    "border-ui-border-base opacity-50 cursor-not-allowed": isAlreadyAdded,
                                                                    "border-ui-border-strong hover:border-ui-border-interactive": !isAlreadyAdded,
                                                                }
                                                            )}
                                                            onClick={() => {
                                                                if (!isAlreadyAdded) {
                                                                    append({
                                                                        ...pm,
                                                                        isThumbnail: false,
                                                                    })
                                                                }
                                                            }}
                                                        >
                                                            {isAlreadyAdded && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-ui-bg-base/80 z-10">
                                                                    <Text size="xsmall" className="text-ui-fg-muted">
                                                                        {t("general.added")}
                                                                    </Text>
                                                                </div>
                                                            )}
                                                            <img
                                                                src={pm.url}
                                                                alt=""
                                                                className="size-full object-cover"
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <CommandBar open={!!selectionCount}>
                                    <CommandBar.Bar>
                                        <CommandBar.Value>
                                            {t("general.countSelected", {
                                                count: selectionCount,
                                            })}
                                        </CommandBar.Value>
                                        <CommandBar.Seperator />
                                        {selectionCount === 1 && (
                                            <Fragment>
                                                <CommandBar.Command
                                                    action={handlePromoteToThumbnail}
                                                    label={t("products.media.makeThumbnail")}
                                                    shortcut="t"
                                                />
                                                <CommandBar.Seperator />
                                            </Fragment>
                                        )}
                                        <CommandBar.Command
                                            action={handleDelete}
                                            label={t("actions.delete")}
                                            shortcut="d"
                                        />
                                    </CommandBar.Bar>
                                </CommandBar>
                            </div>
                        </div>
                    )
                }}
            </VariantMediaViewContext.Consumer>
        </FormProvider>
    )
}

const dropAnimationConfig: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
        styles: {
            active: {
                opacity: "0.4",
            },
        },
    }),
}