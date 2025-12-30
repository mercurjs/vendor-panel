import { getLinkedFields } from "../../../extensions"

// Linked fields without custom_tags (fetched via dedicated endpoint)
export const PRODUCT_DETAIL_FIELDS = getLinkedFields("product", "")
