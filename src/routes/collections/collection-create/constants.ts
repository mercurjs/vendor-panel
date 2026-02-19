import { z } from "zod"

export const RequestCollectionMediaSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  isThumbnail: z.boolean(),
  isBanner: z.boolean().optional(),
  file: z.any().nullable(),
  field_id: z.string().optional(),
})

export const RequestCollectionRankingItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  isNew: z.boolean().optional(),
})

export const RequestCollectionSchema = z.object({
  title: z.string().min(1),
  handle: z.string().optional(),
  media: z.array(RequestCollectionMediaSchema).optional(),
  icon: z
    .object({
      id: z.string().optional(),
      url: z.string(),
      file: z.any().nullable(),
    })
    .nullable()
    .optional(),
  ranking: z.array(RequestCollectionRankingItemSchema).optional(),
})

export type RequestCollectionSchemaType = z.infer<typeof RequestCollectionSchema>
export type RequestCollectionMediaSchemaType = z.infer<
  typeof RequestCollectionMediaSchema
>
export type RequestCollectionRankingItemSchemaType = z.infer<
  typeof RequestCollectionRankingItemSchema
>

export const REQUEST_COLLECTION_RANKING_MOCK: RequestCollectionRankingItemSchemaType[] =
  [
    { id: "1", title: "Streetwear", isNew: true },
    { id: "2", title: "Collection Name", isNew: false },
    { id: "3", title: "Collection Name", isNew: false },
  ]

export const REQUEST_COLLECTION_FORM_DEFAULTS: Partial<RequestCollectionSchemaType> =
  {
    title: "",
    handle: "",
    media: [],
    icon: null,
    ranking: REQUEST_COLLECTION_RANKING_MOCK,
  }
