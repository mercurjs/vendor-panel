
/**
 * Base structure of campaign form fields
 * 
 * This defines the minimum required structure for any form that uses
 * the CreateCampaignFormFields component
 */
export interface CampaignFormFields {
  name: string
  description?: string
  campaign_identifier: string
  starts_at: Date | null
  ends_at: Date | null
  budget: {
    type: "spend" | "usage"
    limit?: number | null
    currency_code?: string | null
  }
}

/**
 * Type constraint for forms with nested campaign fields
 * 
 * This represents forms where campaign fields are nested under a "campaign" property,
 * such as when creating a promotion with a new campaign.
 */
export interface WithNestedCampaign {
  campaign?: CampaignFormFields
  application_method?: {
    currency_code?: string
  }
}

/**
 * Helper type to create a field path with optional scope prefix
 *
 * @template T - The base field path (e.g., "name", "budget.type")
 */
export type ScopedPath<T extends string> = T | `campaign.${T}`

