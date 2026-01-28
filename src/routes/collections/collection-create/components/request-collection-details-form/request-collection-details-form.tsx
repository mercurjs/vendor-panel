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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  DotsSix,
  Eye,
  StackPerspective,
  ThumbnailBadge,
  Trash,
  XMark,
} from "@medusajs/icons"
import { Heading, IconButton, Input, Text } from "@medusajs/ui"
import { useCallback, useState } from "react"
import { useFieldArray, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { FileType, FileUpload } from "../../../../../components/common/file-upload"
import { Form } from "../../../../../components/common/form"
import { HandleInput } from "../../../../../components/inputs/handle-input"
import { ActionMenu } from "../../../../../components/common/action-menu"
import {
  RequestCollectionMediaSchemaType,
  RequestCollectionSchemaType,
} from "../../constants"

const SUPPORTED_IMAGE_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/svg+xml",
]
const SUPPORTED_ICON_FORMATS = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
]

type RequestCollectionDetailsFormProps = {
  form: UseFormReturn<RequestCollectionSchemaType>
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  )
}

type MediaField = RequestCollectionMediaSchemaType & {
  field_id?: string
  file?: File
}

function MediaItem({
  field,
  onDelete,
  onRemoveThumbnail,
  onMakeBanner,
}: {
  field: MediaField
  onDelete: () => void
  onRemoveThumbnail: () => void
  onMakeBanner: () => void
}) {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.field_id ?? field.id ?? "" })

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  if (!field.file) return null

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-ui-bg-component shadow-elevation-card-rest flex items-center justify-between rounded-lg px-3 py-2"
    >
      <div className="flex items-center gap-x-2">
        <IconButton
          variant="transparent"
          type="button"
          size="small"
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
          className="cursor-grab touch-none active:cursor-grabbing"
        >
          <DotsSix className="text-ui-fg-muted" />
        </IconButton>
        <div className="flex items-center gap-x-3">
          <div className="bg-ui-bg-base h-10 w-[30px] overflow-hidden rounded-md">
            {field.url ? (
              <img
                src={field.url}
                alt=""
                className="size-full object-cover object-center"
              />
            ) : null}
          </div>
          <div className="flex flex-col">
            <Text size="small" leading="compact">
              {field.file.name}
            </Text>
            <div className="flex items-center gap-x-1">
              {field.isThumbnail && <ThumbnailBadge />}
              <Text size="xsmall" leading="compact" className="text-ui-fg-subtle">
                {formatFileSize(field.file.size)}
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-x-1">
        <IconButton type="button" size="small" variant="transparent" title="">
          <Eye className="text-ui-fg-muted" />
        </IconButton>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("collections.requestCollection.removeThumbnail"),
                  icon: <StackPerspective />,
                  onClick: onRemoveThumbnail,
                },
                {
                  label: t("collections.requestCollection.makeBanner"),
                  icon: <StackPerspective />,
                  onClick: onMakeBanner,
                },
              ],
            },
            {
              actions: [
                {
                  icon: <Trash />,
                  label: t("actions.delete"),
                  onClick: onDelete,
                },
              ],
            },
          ]}
        />
        <IconButton
          type="button"
          size="small"
          variant="transparent"
          onClick={onDelete}
        >
          <XMark />
        </IconButton>
      </div>
    </li>
  )
}

export const RequestCollectionDetailsForm = ({
  form,
}: RequestCollectionDetailsFormProps) => {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "media",
    keyName: "field_id",
  })
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id)
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => (f as MediaField).field_id === active.id)
      const newIndex = fields.findIndex((f) => (f as MediaField).field_id === over?.id)
      if (oldIndex >= 0 && newIndex >= 0) {
        const reordered = arrayMove(fields, oldIndex, newIndex)
        form.setValue("media", reordered, { shouldDirty: true, shouldTouch: true })
      }
    }
  }
  const handleDragCancel = () => setActiveId(null)

  const onMediaUploaded = useCallback(
    (files: FileType[]) => {
      form.clearErrors("media")
      files.forEach((f) =>
        append({
          url: f.url,
          file: f.file,
          isThumbnail: false,
          isBanner: false,
          field_id: f.id,
        } as RequestCollectionMediaSchemaType & { field_id: string })
      )
    },
    [form, append]
  )

  const getRemoveThumbnail = (index: number) => () => {
    const next = fields.map((f, i) =>
      i === index ? { ...f, isThumbnail: false } : f
    )
    form.setValue("media", next, { shouldDirty: true, shouldTouch: true })
  }
  const getMakeBanner = (index: number) => () => {
    const next = fields.map((f, i) => ({
      ...f,
      isBanner: i === index,
    }))
    form.setValue("media", next, { shouldDirty: true, shouldTouch: true })
  }

  const iconValue = form.watch("icon")
  const onIconUploaded = useCallback(
    (files: FileType[]) => {
      const f = files[0]
      if (f)
        form.setValue("icon", {
          url: f.url,
          file: f.file,
          id: f.id,
        })
    },
    [form]
  )
  const clearIcon = () => form.setValue("icon", null, { shouldDirty: true })

  return (
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-8">
        <div>
          <Heading>{t("collections.createCollection")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("collections.createCollectionHint")}
          </Text>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t("fields.title")}</Form.Label>
                <Form.Control>
                  <Input autoComplete="off" {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="handle"
            render={({ field }) => (
              <Form.Item>
                <Form.Label optional tooltip={t("collections.handleTooltip")}>
                  {t("fields.handle")}
                </Form.Label>
                <Form.Control>
                  <HandleInput {...field} />
                </Form.Control>
                <Form.ErrorMessage />
              </Form.Item>
            )}
          />
        </div>

        <Form.Field
          control={form.control}
          name="media"
          render={() => (
            <Form.Item>
              <Form.Label optional>
                {t("collections.requestCollection.mediaLabel")}
              </Form.Label>
              <Form.Control>
                <div className="flex flex-col gap-y-2">
                  <FileUpload
                    label={t("products.media.uploadImagesLabel")}
                    hint={t("collections.requestCollection.mediaHint")}
                    hasError={!!form.formState.errors.media}
                    formats={SUPPORTED_IMAGE_FORMATS}
                    onUploaded={onMediaUploaded}
                  />
                  <DndContext
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    onDragStart={handleDragStart}
                    onDragCancel={handleDragCancel}
                  >
                    <DragOverlay dropAnimation={dropAnimationConfig}>
                      {activeId ? (() => {
                        const field = fields.find((f) => (f as MediaField).field_id === activeId) as MediaField | undefined
                        return field?.file ? (
                          <MediaItem
                            field={field}
                            onDelete={() => {}}
                            onRemoveThumbnail={() => {}}
                            onMakeBanner={() => {}}
                          />
                        ) : null
                      })() : null}
                    </DragOverlay>
                    <ul className="flex flex-col gap-y-2">
                      <SortableContext
                        items={fields.map((f, i) => (f as MediaField).field_id ?? `media-${i}`)}
                      >
                        {fields.map((field, index) => (
                          <MediaItem
                            key={(field as MediaField).field_id}
                            field={field as MediaField}
                            onDelete={() => remove(index)}
                            onRemoveThumbnail={getRemoveThumbnail(index)}
                            onMakeBanner={getMakeBanner(index)}
                          />
                        ))}
                      </SortableContext>
                    </ul>
                  </DndContext>
                </div>
              </Form.Control>
              <Form.ErrorMessage />
            </Form.Item>
          )}
        />

        <Form.Field
          control={form.control}
          name="icon"
          render={() => (
            <Form.Item>
              <Form.Label optional>
                {t("collections.requestCollection.iconLabel")}
              </Form.Label>
              <Form.Control>
                <div className="flex flex-col gap-y-2">
                  {!iconValue?.url ? (
                    <FileUpload
                      label={t("collections.requestCollection.iconLabel")}
                      hint={t("collections.requestCollection.iconHint")}
                      formats={SUPPORTED_ICON_FORMATS}
                      multiple={false}
                      onUploaded={onIconUploaded}
                    />
                  ) : (
                    <div className="bg-ui-bg-component border-ui-border-strong flex items-center justify-between rounded-lg border border-dashed p-4">
                      <div className="flex items-center gap-x-2">
                        <img
                          src={iconValue.url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                        <Text size="small">
                          {iconValue.file?.name ?? "Icon"}
                        </Text>
                      </div>
                      <IconButton
                        size="small"
                        variant="transparent"
                        onClick={clearIcon}
                      >
                        <XMark />
                      </IconButton>
                    </div>
                  )}
                  <div className="bg-ui-bg-subtle flex items-start gap-x-2 rounded-lg p-3">
                    <span className="text-ui-fg-muted mt-0.5 text-xs">i</span>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {t("collections.requestCollection.iconTip")}
                    </Text>
                  </div>
                </div>
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </div>
  )
}
