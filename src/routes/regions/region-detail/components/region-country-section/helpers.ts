import { StaticCountry } from "../../../../../lib/data/countries"
import { HttpTypes } from "@medusajs/types"

/**
 * Converts API region countries to static countries for use with useCountries hook.
 * StaticCountry requires all fields to be non-optional (except id which is omitted).
 */
export const convertToStaticCountries = (
    apiCountries: HttpTypes.AdminRegionCountry[] | undefined
  ): StaticCountry[] => {
    if (!apiCountries) return []
    
    return apiCountries
      .filter((c): c is Required<HttpTypes.AdminRegionCountry> => 
        c.iso_2 !== undefined &&
        c.iso_3 !== undefined &&
        c.num_code !== undefined &&
        c.name !== undefined &&
        c.display_name !== undefined
      )
      .map(({ id, ...country }) => country as StaticCountry)
  }