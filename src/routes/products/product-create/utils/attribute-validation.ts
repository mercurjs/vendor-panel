import { z } from "zod"

type Attribute = {
    id: string
    name: string
    handle: string
    ui_component: "select" | "multivalue" | "unit" | "toggle" | "text" | "color_picker" | "text_area"
    is_required: boolean
    possible_values?: Array<{
        id: string
        value: string
    }>
}

/**
 * Creates dynamic validation schema for attributes based on their configuration
 */
export const createAttributeValidationSchema = (attributes: Attribute[], t: (key: string, options?: any) => string) => {
    const attributeFields: Record<string, z.ZodTypeAny> = {}

    attributes.forEach((attr) => {
        const fieldName = attr.handle
        const isRequired = attr.is_required

        switch (attr.ui_component) {
            case "select":
                // Single select - string value
                attributeFields[fieldName] = isRequired
                    ? z.string().min(1, t("products.fields.attributes.validation.required", { name: attr.name }))
                    : z.string().optional()
                break

            case "multivalue":
                // Multi select - array of strings
                attributeFields[fieldName] = isRequired
                    ? z.array(z.string()).min(1, t("products.fields.attributes.validation.required", { name: attr.name }))
                    : z.array(z.string()).optional()

                // Add "Use for Variants" toggle for multiselect fields
                attributeFields[`${fieldName}UseForVariants`] = z.boolean().optional()
                break

            case "text":
            case "text_area":
                // Text input - string value
                attributeFields[fieldName] = isRequired
                    ? z.string().min(1, t("products.fields.attributes.validation.required", { name: attr.name }))
                    : z.string().optional()
                break

            case "toggle":
                // Toggle - boolean value
                attributeFields[fieldName] = isRequired
                    ? z.boolean().refine((val) => val === true, {
                        message: t("products.fields.attributes.validation.required", { name: attr.name })
                    })
                    : z.boolean().optional()
                break

            case "unit":
                // Numeric input - number value
                attributeFields[fieldName] = isRequired
                    ? z.number().min(0, t("products.fields.attributes.validation.required", { name: attr.name }))
                    : z.number().optional()
                break

            case "color_picker":
                // Color picker - string value (hex color)
                attributeFields[fieldName] = isRequired
                    ? z.string().min(1, t("products.fields.attributes.validation.required", { name: attr.name }))
                    : z.string().optional()
                break

            default:
                // Fallback to string for unknown types
                attributeFields[fieldName] = isRequired
                    ? z.string().min(1, t("products.fields.attributes.validation.required", { name: attr.name }))
                    : z.string().optional()
                break
        }
    })

    return z.object(attributeFields)
}

/**
 * Merges dynamic attribute validation with existing schema
 */
export const mergeAttributeValidation = <T extends z.ZodRawShape>(
    baseSchema: z.ZodObject<T>,
    attributes: Attribute[],
    t: (key: string, options?: any) => string
) => {
    const attributeSchema = createAttributeValidationSchema(attributes, t)
    return baseSchema.merge(attributeSchema)
}

/**
 * Creates a validation function for attributes that can be used with react-hook-form
 */
export const createAttributeValidationRules = (attributes: Attribute[], t: (key: string, options?: any) => string) => {
    const rules: Record<string, any> = {}

    attributes.forEach((attr) => {
        const fieldName = attr.handle
        const isRequired = attr.is_required

        if (isRequired) {
            switch (attr.ui_component) {
                case "select":
                    rules[fieldName] = {
                        required: t("products.fields.attributes.validation.requiredSelect"),
                        validate: (value: string) => {
                            if (!value || value === '') {
                                return t("products.fields.attributes.validation.requiredSelect")
                            }
                            return true
                        }
                    }
                    break
                case "text":
                case "text_area":
                case "color_picker":
                    rules[fieldName] = {
                        required: t("products.fields.attributes.validation.requiredEnter"),
                        validate: (value: string) => {
                            if (!value || value === '') {
                                return t("products.fields.attributes.validation.requiredEnter")
                            }
                            return true
                        }
                    }
                    break

                case "multivalue":
                    rules[fieldName] = {
                        required: t("products.fields.attributes.validation.requiredSelectMultiple"),
                        validate: (value: string[]) => {
                            if (!value || value.length === 0) {
                                return t("products.fields.attributes.validation.requiredSelectMultiple")
                            }
                            return true
                        }
                    }
                    break

                case "toggle":
                    rules[fieldName] = {
                        required: t("products.fields.attributes.validation.requiredSelect"),
                        validate: (value: string) => {
                            if (!value || value === '') {
                                return t("products.fields.attributes.validation.requiredSelect")
                            }
                            return true
                        }
                    }
                    break

                case "unit":
                    rules[fieldName] = {
                        required: t("products.fields.attributes.validation.requiredEnter"),
                        validate: (value: string | number) => {
                            if (value === undefined || value === null || value === '') {
                                return t("products.fields.attributes.validation.requiredEnter")
                            }
                            return true
                        }
                    }
                    break

                default:
                    rules[fieldName] = {
                        required: t("products.fields.attributes.validation.requiredEnter"),
                        validate: (value: string) => {
                            if (!value || value === '') {
                                return t("products.fields.attributes.validation.requiredEnter")
                            }
                            return true
                        }
                    }
                    break
            }
        }
    })

    return rules
}
