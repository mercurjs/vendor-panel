import { FetchError } from "@medusajs/js-sdk"
import {
    QueryKey,
    UseQueryOptions,
    useQuery,
} from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"
import { queryKeysFactory } from "../../lib/query-key-factory"

const ATTRIBUTES_QUERY_KEY = "attributes" as const
export const attributesQueryKeys = queryKeysFactory(ATTRIBUTES_QUERY_KEY)

type Attribute = {
    id: string
    name: string
    handle: string
    ui_component: string
    is_required: boolean
    values?: Array<{
        id: string
        value: string
        metadata?: Record<string, any>
    }>
    metadata?: Record<string, any>
}

export const useAttributes = (
    query?: {
        offset?: number
        limit?: number
        fields?: string
        id?: string
        name?: string
        handle?: string
        ui_component?: "select" | "multivalue" | "unit" | "toggle" | "text_area" | "color_picker"
    },
    options?: Omit<
        UseQueryOptions<
            {
                attributes: Attribute[]
                count: number
                offset: number
                limit: number
            },
            FetchError,
            {
                attributes: Attribute[]
                count: number
                offset: number
                limit: number
            },
            QueryKey
        >,
        "queryFn" | "queryKey"
    >
) => {
    const { data, ...rest } = useQuery({
        queryFn: () =>
            fetchQuery("/vendor/attributes", {
                method: "GET",
                query: query as Record<string, string | number>,
            }),
        queryKey: attributesQueryKeys.list(query),
        ...options,
    })

    return { ...data, ...rest }
}

export const useAttribute = (
    id: string,
    options?: Omit<
        UseQueryOptions<
            {
                attribute: Attribute
            },
            FetchError,
            {
                attribute: Attribute
            },
            QueryKey
        >,
        "queryFn" | "queryKey"
    >
) => {
    const { data, ...rest } = useQuery({
        queryFn: () =>
            fetchQuery(`/vendor/attributes/${id}`, {
                method: "GET",
            }),
        queryKey: attributesQueryKeys.detail(id),
        ...options,
    })

    return { ...data, ...rest }
}

export const useAttributeOptions = (
    uiComponent?: "select" | "multivalue" | "unit" | "toggle" | "text_area" | "color_picker"
) => {
    const result = useAttributes(
        uiComponent ? { ui_component: uiComponent } : undefined
    )

    const attributeOptions = (result as any).data?.attributes?.map((attribute: Attribute) => ({
        value: attribute.id,
        label: attribute.name,
        handle: attribute.handle,
        ui_component: attribute.ui_component,
        is_required: attribute.is_required,
        values: attribute.values?.map((value: any) => ({
            value: value.id,
            label: value.value,
        })),
    })) || []

    return {
        attributes: attributeOptions,
        isLoading: result.isLoading,
        error: result.error,
    }
}

export const useAttributeValues = (attributeId: string) => {
    const result = useAttribute(attributeId)

    const values = (result as any).data?.attribute?.values?.map((value: any) => ({
        value: value.id,
        label: value.value,
    })) || []

    return {
        values,
        isLoading: result.isLoading,
        error: result.error,
    }
}

export const useRequiredAttributes = () => {
    const result = useAttributes()

    const requiredAttributes = (result as any).data?.attributes?.filter((attr: Attribute) => attr.is_required) || []

    return {
        requiredAttributes,
        isLoading: result.isLoading,
        error: result.error,
    }
}