/**
 * Type representing a processed form field ready for use in the form.
 * This is the transformed version of Attribute with:
 * - possible_values mapped from {id, value} to {value, label} format
 * - Structure optimized for form components (Combobox, MultiSelect, etc.)
 */
export type FormField = {
  key: string;
  id: string;
  name: string;
  handle: string;
  ui_component: 'select' | 'multivalue' | 'unit' | 'toggle' | 'text' | 'text_area' | 'color_picker';
  is_required: boolean;
  description?: string;
  possible_values: Array<{ value: string; label: string }>;
};

/**
 * Type representing the result of processing attributes.
 * Contains processed form fields organized by type and requirement status.
 */
export type ProcessedAttributes = {
  required: {
    categorySpecific: FormField[];
    global: FormField[];
    all: FormField[];
  };
};

/**
 * Processes attributes and organizes them by category and requirement status.
 *
 * **Purpose:**
 * Transforms raw attribute data from API into a format suitable for form rendering,
 * organizing attributes by category (global vs category-specific) and requirement status.
 *
 * **What it does:**
 * 1. Filters attributes into two groups:
 *    - Global attributes: attributes not assigned to any category
 *    - Category-specific attributes: attributes assigned to one or more categories
 *
 * 2. For category-specific attributes, filters only those applicable to the selected primary category
 *
 * 3. Maps attributes to FormField format:
 *    - Transforms possible_values from {id, value} to {value, label} format
 *    - Preserves all other attribute properties
 *
 * 4. Organizes required attributes separately for category-specific and global groups
 *
 * 5. Returns an object with organized attributes, allowing for future expansion
 *
 * **Parameters:**
 * @param allAttributes - Raw attributes array from API (can be undefined if not loaded yet)
 * @param primaryCategoryId - ID of the selected primary category (can be undefined if no category selected)
 *
 * **Returns:**
 * Object containing processed attributes organized by requirement status:
 * - required.categorySpecific: Required attributes specific to the selected category
 * - required.global: Required global attributes
 * - required.all: Combined array of all required attributes (category-specific first, then global)
 *
 * **Example:**
 * Input: [{id: "1", name: "Color", is_required: true, product_categories: [{id: "cat-1"}]}, ...]
 * Output: {
 *   required: {
 *     categorySpecific: [{key: "1", id: "1", name: "Color", ...}],
 *     global: [],
 *     all: [{key: "1", id: "1", name: "Color", ...}]
 *   }
 * }
 */
export const processAttributes = (
  allAttributes:
    | Array<{
        id: string;
        name: string;
        handle: string;
        ui_component: string;
        is_required: boolean;
        description?: string;
        product_categories?: Array<{ id: string; name: string }>;
        possible_values?: Array<{ id: string; value: string }>;
      }>
    | undefined,
  primaryCategoryId: string | undefined
): ProcessedAttributes => {
  // Early return if no attributes provided
  if (!allAttributes || allAttributes.length === 0) {
    return {
      required: {
        categorySpecific: [],
        global: [],
        all: []
      }
    };
  }

  /**
   * Step 1: Filter global attributes
   * Purpose: Separate attributes that are not assigned to any category
   * These attributes are available for all products regardless of category
   */
  const globalAttributes = allAttributes.filter(
    attr => !attr.product_categories || attr.product_categories.length === 0
  );

  /**
   * Step 2: Filter category-specific attributes
   * Purpose: Separate attributes that are assigned to one or more categories
   * These attributes are only available for products in specific categories
   */
  const categorySpecificAttributes = allAttributes.filter(
    attr => attr.product_categories && attr.product_categories.length > 0
  );

  /**
   * Step 3: Filter attributes applicable to selected category
   * Purpose: From category-specific attributes, get only those that match the selected primary category
   * This ensures we show only relevant attributes for the product's category
   */
  const applicableCategoryAttributes = categorySpecificAttributes.filter(attr =>
    attr.product_categories?.some(cat => cat.id === primaryCategoryId)
  );

  /**
   * Step 4: Map category-specific attributes to form fields
   * Purpose: Transform API data format to form field format and filter only required ones
   * Operations:
   * - Filters to include only required attributes (is_required === true)
   * - Maps possible_values from {id, value} to {value, label} for form components
   * - Preserves all other attribute properties
   */
  const requiredCategorySpecificFormFields: FormField[] = applicableCategoryAttributes
    .filter(attr => attr.is_required)
    .map(attr => ({
      key: attr.id,
      id: attr.id,
      name: attr.name,
      handle: attr.handle,
      ui_component: attr.ui_component as FormField['ui_component'],
      is_required: attr.is_required,
      description: attr.description,
      possible_values:
        attr.possible_values?.map(value => ({
          value: value.id,
          label: value.value
        })) || []
    }));

  /**
   * Step 5: Map global attributes to form fields
   * Purpose: Transform global attributes to form field format and filter only required ones
   * Same operations as Step 4, but for global attributes
   */
  const requiredGlobalFormFields: FormField[] = globalAttributes
    .filter(attr => attr.is_required)
    .map(attr => ({
      key: attr.id,
      id: attr.id,
      name: attr.name,
      handle: attr.handle,
      ui_component: attr.ui_component as FormField['ui_component'],
      is_required: attr.is_required,
      description: attr.description,
      possible_values:
        attr.possible_values?.map(value => ({
          value: value.id,
          label: value.value
        })) || []
    }));

  /**
   * Step 6: Combine and return
   * Purpose: Return organized attributes in an object structure
   * This allows for future expansion (e.g., optional attributes, all attributes, etc.)
   * The 'all' array combines category-specific first, then global attributes
   */
  return {
    required: {
      categorySpecific: requiredCategorySpecificFormFields,
      global: requiredGlobalFormFields,
      all: [...requiredCategorySpecificFormFields, ...requiredGlobalFormFields]
    }
  };
};
