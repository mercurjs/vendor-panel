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
import { DotsSix } from "@medusajs/icons"
import { Badge, IconButton, Text } from "@medusajs/ui"
import { useCallback, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  RequestCollectionRankingItemSchemaType,
  RequestCollectionSchemaType,
} from "../../constants"

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
}

function CollectionTeardropIcon() {
  return (
    <div
      className="bg-ui-tag-blue-bg size-5 shrink-0 rounded-full"
      aria-hidden
    />
  )
}

function RankingRowContent({
  item,
  isOverlay = false,
}: {
  item: RequestCollectionRankingItemSchemaType
  isOverlay?: boolean
}) {
  const { t } = useTranslation()
  return (
    <>
      <IconButton
        variant="transparent"
        type="button"
        size="small"
        className={!isOverlay ? "cursor-grab touch-none active:cursor-grabbing" : ""}
      >
        <DotsSix className="text-ui-fg-muted" />
      </IconButton>
      <CollectionTeardropIcon />
      <div className="flex min-w-0 flex-1 items-center gap-x-2">
        <Text size="small" leading="compact" className="truncate">
          {item.title}
        </Text>
        {item.isNew && (
          <Badge size="small" color="blue">
            {t("collections.requestCollection.newBadge")}
          </Badge>
        )}
      </div>
    </>
  )
}

function RankingRow({
  item,
}: {
  item: RequestCollectionRankingItemSchemaType
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
  } = useSortable({ id: item.id })

  const style = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="bg-ui-bg-component shadow-elevation-card-rest flex items-center gap-x-2 rounded-lg px-3 py-2"
    >
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
      <CollectionTeardropIcon />
      <div className="flex min-w-0 flex-1 items-center gap-x-2">
        <Text size="small" leading="compact" className="truncate">
          {item.title}
        </Text>
        {item.isNew && (
          <Badge size="small" color="blue">
            {t("collections.requestCollection.newBadge")}
          </Badge>
        )}
      </div>
    </li>
  )
}

type RequestCollectionOrganizeRankingFormProps = {
  form: UseFormReturn<RequestCollectionSchemaType>
}

export const RequestCollectionOrganizeRankingForm = ({
  form,
}: RequestCollectionOrganizeRankingFormProps) => {
  const ranking = form.watch("ranking") ?? []
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = ranking.findIndex((r: RequestCollectionRankingItemSchemaType) => r.id === active.id)
        const newIndex = ranking.findIndex((r: RequestCollectionRankingItemSchemaType) => r.id === over.id)
        if (oldIndex >= 0 && newIndex >= 0) {
          const next = arrayMove(ranking, oldIndex, newIndex)
          form.setValue("ranking", next, { shouldDirty: true, shouldTouch: true })
        }
      }
    },
    [form, ranking]
  )

  const handleDragCancel = useCallback(() => setActiveId(null), [])

  const activeItem = activeId
    ? ranking.find((r: RequestCollectionRankingItemSchemaType) => r.id === activeId)
    : undefined

  return (
    <div className="flex flex-col items-center p-16">
      <div className="flex w-full max-w-[720px] flex-col gap-y-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeItem ? (
              <li className="bg-ui-bg-component shadow-elevation-card-rest flex items-center gap-x-2 rounded-lg px-3 py-2">
                <RankingRowContent item={activeItem} isOverlay />
              </li>
            ) : null}
          </DragOverlay>
          <SortableContext items={ranking.map((r: RequestCollectionRankingItemSchemaType) => r.id)}>
            <ul className="flex flex-col gap-y-2">
              {ranking.map((item: RequestCollectionRankingItemSchemaType) => (
                <RankingRow key={item.id} item={item} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}
