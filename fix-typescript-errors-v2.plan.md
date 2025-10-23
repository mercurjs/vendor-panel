# Fix TypeScript Errors - Comprehensive Plan

## Overview

This document categorizes and groups all TypeScript errors from `ts-errors.log` into actionable categories. Total: **638 errors** across **158 files**.

---

## ✅ Category 1: Unused Variables/Imports/Arguments (49 errors) - **WILL FIX**

These are safe to fix by removing or prefixing with underscore.

### Files to Clean Up:

1. **src/components/layout/settings-layout/settings-layout.tsx:96** - `developerRoutes` declared but never read
2. **src/routes/categories/category-detail/components/category-product-section/category-product-section.tsx** (7 errors):
   - Line 1: `PlusMini` unused import
   - Line 4: `Checkbox` unused import
   - Line 5: `CommandBar` unused import
   - Line 16: `ActionMenu` unused import
   - Line 59: `filters` unused variable
   - Line 77: `handleRemove` unused function
   - Line 179: `columnHelper` unused variable

3. **src/routes/categories/category-edit/components/edit-category-form/edit-category-form.tsx:12** - `useUpdateProductCategory` unused import

4. **src/routes/customers/customer-detail/components/customer-group-section/customer-group-section.tsx:50** - `count` unused variable

5. **src/routes/locations/location-service-zone-shipping-option-create/components/create-shipping-options-form/create-shipping-option-details-form.tsx** (8 errors):
   - Line 1: `Divider` unused import
   - Line 1: `Select` unused import
   - Line 8: `SwitchBox` unused import
   - Line 11: `sdk` unused import
   - Line 12: `formatProvider` unused import
   - Line 33: `locationId` unused variable
   - Line 34: `fulfillmentProviderOptions` unused variable
   - Line 35: `selectedProviderId` unused variable

6. **src/routes/locations/location-service-zone-shipping-option-pricing/components/create-shipping-options-form/edit-shipping-options-pricing-form.tsx** (2 errors):
   - Line 35: `buildShippingOptionPriceRules` unused import
   - Line 125: `currencyPrices` unused variable

7. **src/routes/orders/order-allocate-items/components/order-create-fulfillment-form/order-allocate-items-form.tsx:57** - `noItemsToAllocate` unused variable

8. **src/routes/orders/order-create-claim/components/add-claim-items-table/use-claim-item-table-columns.tsx:78** - `getValue` unused parameter

9. **src/routes/orders/order-create-edit/components/order-edit-create-form/order-edit-create-form.tsx:61** - `data` unused parameter

10. **src/routes/orders/order-create-edit/order-edit-create.tsx** (2 errors):
    - Line 2: `useState` unused import
    - Line 44: `order` unused variable

11. **src/routes/orders/order-create-exchange/components/add-exchange-inbound-items-table/add-exchange-inbound-items-table.tsx:187** - `defaultOperators` unused variable

12. **src/routes/orders/order-create-exchange/components/add-exchange-inbound-items-table/use-exchange-item-table-columns.tsx:78** - `getValue` unused parameter

13. **src/routes/orders/order-create-refund/components/create-refund-form/create-refund-form.tsx:38** - `refundReasons` unused variable

14. **src/routes/orders/order-create-return/components/add-return-items-table/use-return-item-table-columns.tsx:78** - `getValue` unused parameter

15. **src/routes/orders/order-create-return/components/return-create-form/return-item.tsx:3** - `React` unused import

16. **src/routes/orders/order-detail/components/order-activity-section/order-timeline.tsx** (4 errors):
    - Line 24: `useClaims` unused import
    - Line 27: `useExchanges` unused import
    - Line 29: `useReturns` unused import
    - Line 44: `NOTE_LIMIT` unused constant

17. **src/routes/orders/order-detail/components/order-summary-section/order-summary-section.tsx** (5 errors):
    - Line 7: `ArrowPath` unused import
    - Line 8: `ArrowUturnLeft` unused import
    - Line 9: `ExclamationCircle` unused import
    - Line 279: `shouldDisableReturn` unused variable
    - Line 283: `isOrderEditActive` unused variable

18. **src/routes/orders/order-receive-return/components/order-receive-return-form/dismissed-quantity.tsx:51** - `receivedQuantity` unused variable

19. **src/routes/product-variants/product-variant-edit/components/product-edit-variant-form/product-edit-variant-form.tsx:2** - `Switch` unused import

20. **src/routes/products/product-create-variant/components/create-product-variant-form/inventory-kit-tab.tsx:1** - `React` unused import

21. **src/routes/products/product-create-variant/components/create-product-variant-form/pricing-tab.tsx:1** - `React` unused import

22. **src/routes/products/product-detail/product-detail.tsx:14** - `ProductAdditionalAttributesSection` unused import

23. **src/routes/products/product-edit/components/edit-product-form/edit-product-form.tsx:1** - `Select` unused import

24. **src/routes/products/product-prices/pricing-edit.tsx:13** - `useUpdateProductVariantsBatch` unused import

25. **src/routes/products/product-shipping-profile/components/product-organization-form/product-shipping-profile-form.tsx:15** - `se` unused import

26. **src/routes/products/product-stock/product-stock.tsx:71** - `data` unused variable

27. **src/routes/reservations/reservation-list/components/reservation-list-table/use-reservation-table-columns.tsx:4** - `LinkButton` unused import

---

## 📋 Category 2: Missing File Error (1 error)

**File:** `src/routes/store/store-detail/components/store-currency-section/store-currencies-section.tsx`
- **Error:** File not found but specified for compilation
- **Action:** Either create the file or remove it from tsconfig references

---

## 🔧 Category 3: Icon Component Props Issues (2 errors)

**File:** `src/components/common/calendar/calendar.tsx`
- Lines 63, 69: Props spread incompatible with IconProps (ChevronLeft/ChevronRight)
- **Issue:** Icon components don't accept certain HTML button props
- **Solution:** Filter props before spreading or use type assertion

---

## 🔄 Category 4: Generic Type Parameter Issues (2 errors)

**File:** `src/components/data-grid/components/data-grid-root.tsx`
- Lines 858, 861: `VirtualItem` is not generic
- **Issue:** Type definition changed in library
- **Solution:** Remove `<Element>` generic parameter

---

## 🎯 Category 5: Generic ForwardRef Type Issue (1 error)

**File:** `src/components/utilities/generic-forward-ref/generic-forward-ref.tsx:6`
- **Issue:** Generic type inference problem with forwardRef
- **Solution:** Use type assertion `as any` or restructure the wrapper

---

## 🔀 Category 6: Controller Field Type Mismatches (2 errors)

1. **src/extensions/forms/form-extension-zone/form-extension-zone.tsx:62**
   - `ControllerRenderProps` template literal type mismatch
   
2. **src/routes/locations/common/components/conditional-price-form/conditional-price-form.tsx** (2 errors at lines 363, 380)
   - Template literal type mismatches for price field paths

---

## 🔗 Category 7: API Response Type Mismatches - Claims (7 errors)

**File:** `src/hooks/api/claims.tsx`
- Line 243: `updateInboundItem` returns preview response instead of claim response
- Line 270: `removeInboundItem` returns preview response
- Line 301: `addInboundShipping` returns preview response
- Line 328: `updateInboundShipping` - actionId parameter mismatch
- Line 354: `deleteInboundShipping` returns preview response
- Line 489: `updateOutboundShipping` - actionId parameter mismatch
- Line 573: `cancelRequest` returns delete response

**Root Cause:** SDK returns preview/delete responses but hooks expect full claim responses
**Solution:** Update hook return types or add type assertions

---

## 🔗 Category 8: API Response Type Mismatches - Exchanges (9 errors)

**File:** `src/hooks/api/exchanges.tsx`
- Line 54: `list()` query function type mismatch
- Line 131: `addInboundItems` returns return response instead of exchange response
- Line 153: `updateInboundItem` returns return response
- Line 179: `removeInboundItem` returns return response
- Line 210: `addInboundShipping` returns return response
- Line 232: `updateInboundShipping` - actionId parameter mismatch
- Line 257: `deleteInboundShipping` returns return response
- Line 377: `updateOutboundShipping` - actionId parameter mismatch
- Line 455: `cancelRequest` returns delete response

**Root Cause:** SDK returns return/preview/delete responses but hooks expect full exchange responses
**Solution:** Update hook return types or add type assertions

---

## 🔗 Category 9: API Response Type Mismatches - Other (3 errors)

1. **src/hooks/api/order-edits.tsx:21**
   - `initiateRequest` returns `AdminOrderEditResponse` instead of `AdminOrderEditPreviewResponse`

2. **src/hooks/api/order-edits.tsx:134**
   - Variable `id` not found (should be `orderId`)

3. **src/hooks/api/price-preferences.tsx:81**
   - Payload type incompatibility between create/update (null vs undefined in attribute)

---

## 👥 Category 10: Customer Group Type Mismatches (15+ errors)

**Core Issue:** Mismatch between `AdminCustomerGroup` and `CustomerGroupData` types

**Files Affected:**
1. **src/hooks/api/customer-groups.tsx:72** - Array type mismatch
2. **src/hooks/table/columns/use-customer-group-table-columns.tsx:24** - Missing `customer_group` property
3. **src/routes/customer-groups/customer-group-list/components/customer-group-list-table/customer-group-list-table.tsx** (8 errors)
4. **src/routes/customers/customer-detail/components/customer-group-section/customer-group-section.tsx** (6 errors)
5. **src/routes/customers/customers-add-customer-group/components/add-customers-form/add-customer-groups-form.tsx** (2 errors)
6. **src/routes/price-lists/common/components/price-list-customer-group-rule-form/price-list-customer-group-rule-form.tsx** (3 errors)
7. **src/routes/tax-regions/common/components/target-form/target-form.tsx** (4 errors)

**Solution:** Unify type definitions or create proper type mappings

---

## 🔢 Category 11: Tax Types Issues (4 errors)

1. **src/hooks/table/columns/use-tax-rates-table-columns.tsx:5**
   - Import error: `TaxRateResponse` doesn't exist, should use `AdminTaxRateResponse`

2. **src/routes/tax-regions/common/components/target-form/target-form.tsx** (3 errors at lines 113, 117, 121)
   - Missing enum properties: `CUSTOMER_GROUP`, `PRODUCT_COLLECTION`, `PRODUCT_TAG`

---

## 📦 Category 12: Order Table Query Issues (1 error)

**File:** `src/hooks/table/query/use-order-table-query.tsx:44`
- Property `fulfillment_status` doesn't exist in `AdminOrderFilters`
- **Solution:** Remove property or update filter type definition

---

## 🔑 Category 13: Query Key Factory Type Issues (2 errors)

**File:** `src/lib/query-key-factory.ts`
- Lines 42, 47: Array type doesn't match required tuple type
- **Issue:** Dynamic array construction doesn't satisfy readonly tuple requirements
- **Solution:** Type assertion or restructure to guarantee tuple shape

---

## 🛒 Category 14: Product Type Issues (50+ errors)

**Core Issue:** `useProducts` hook returns transformed product type that doesn't match `AdminProduct`

**Common Pattern:** Product array type mismatch with thumbnail/images transformation

**Files Affected:**
- Categories: product sections (5 files)
- Collections: product sections (4 files)
- Price lists: product forms (6 files)
- Product variants: detail/edit pages (4 files)
- Products: all CRUD operations (15+ files)
- Sales channels: product sections (2 files)
- Tax regions: target forms (2 files)

**Solution:** Update `useProducts` return type or create proper type mapping

---

## 📦 Category 15: Inventory Type Mismatches (10+ errors)

**Files:**
- `src/routes/inventory/inventory-detail/components/*` (5 errors)
- `src/routes/inventory/inventory-list/components/*` (2 errors)
- `src/routes/inventory/inventory-metadata/*` (3 errors)
- `src/routes/reservations/reservation-detail/components/*` (1 error)
- `src/routes/product-variants/product-variant-detail/components/*` (3 errors)

**Issues:**
- DTO mismatches between Admin types and internal types
- Missing properties like `location_levels`, `inventory_items`
- Type guards needed for optional properties

---

## 🚚 Category 16: Order/Fulfillment Type Issues (100+ errors)

**Largest category** - Order-related operations have extensive type mismatches

**Subcategories:**

### A. Order Line Items (20+ errors)
- Missing properties: `returned_quantity`, `refundable`, `actions`, `variant`
- Null safety issues with titles

### B. Order Allocations (25+ errors)
- Type mismatches between `AdminOrderLineItem` and `OrderLineItemDTO`
- Inventory item type incompatibilities

### C. Claims (20+ errors)
- Variant ID type mismatches in form fields
- Custom amount handling
- Return preview calculations

### D. Exchanges (20+ errors)
- Similar to claims - variant ID and shipping issues
- Form field type mismatches

### E. Returns (20+ errors)
- Default values type mismatches
- Reason ID type issues
- Item selection validation

### F. Order Details/Timeline (15+ errors)
- Activity timeline data transformations
- Change tracking type issues
- Note/event type mismatches

---

## 💰 Category 17: Price/Promotion Type Issues (30+ errors)

**Files:**
- `src/routes/price-lists/*` (10 errors)
- `src/routes/promotions/*` (20 errors)
- `src/routes/products/product-prices/*` (5 errors)

**Issues:**
- `PromotionRuleResponse` missing properties
- `AdminPriceListPrice` type mismatches
- Rule attribute/operator type incompatibilities
- Price rules transformation issues

---

## 🌍 Category 18: Region/Location Type Issues (15+ errors)

**Files:**
- `src/routes/regions/*` (8 errors)
- `src/routes/locations/*` (7 errors)

**Issues:**
- Country type mismatches (`StaticCountry` vs `AdminRegionCountry`)
- Table column type incompatibilities
- Address type mismatches

---

## 📋 Category 19: Metadata Form Type Issues (5 errors)

**Files:**
- `src/routes/categories/categories-metadata/categories-metadata.tsx`
- `src/routes/customers/customer-metadata/customer-metadata.tsx`
- `src/routes/inventory/inventory-metadata/inventory-metadata.tsx`
- `src/routes/sales-channels/sales-channel-metadata/sales-channel-metadata.tsx`
- `src/routes/users/user-metadata/user-metadata.tsx`

**Issue:** `mutateAsync` function signature doesn't match `MetaDataSubmitHook`
- Metadata property type: `Record<string, any> | null | undefined` vs `Record<string, unknown> | undefined`

---

## 🎯 Category 20: Form/Input Type Mismatches (10+ errors)

**Issues:**
- Null vs undefined in form values
- String vs number type coercion
- Optional vs required field mismatches
- Default value type incompatibilities

---

## 🏪 Category 21: Store/Shipping Profile Issues (5 errors)

**Files:**
- `src/routes/shipping-profiles/shipping-profile-detail/shipping-profile-detail.tsx`
- `src/routes/products/product-shipping-profile/*`

**Issues:**
- Shipping profile type incompatibilities
- Optional property handling

---

## ⚠️ Category 22: Toast/UI Component Issues (3 errors)

**Files:**
- `src/routes/orders/order-allocate-items/*`
- `src/routes/orders/order-create-return/*`
- `src/routes/orders/order-receive-return/*`

**Issue:** `dismissLabel` property doesn't exist in `ToastProps` (should be `dismissable`)

---

## 🔍 Category 23: Data Table Type Issues (5 errors)

**Files:**
- `src/routes/tax-regions/common/components/tax-override-table/*`
- `src/routes/tax-regions/common/components/tax-region-table/*`

**Issue:** Order by key type is too strict (string not assignable to specific keys)

---

## 🚫 Category 24: Missing Module Declarations (2 errors)

**Files:**
- `src/routes/tax-regions/tax-region-detail/components/index.ts:1`
- `src/routes/tax-regions/tax-region-province-detail/components/index.ts:1,2`

**Issue:** Modules `./tax-region-general-detail` and `./tax-region-province-section` not found

---

## 🔧 Category 25: TypeScript 7xxx Errors (Implicit Any, etc.) (50+ errors)

**Common Issues:**
- `TS7006`: Parameter implicitly has 'any' type (30+ occurrences)
- `TS7031`: Binding element implicitly has 'any' type (5 occurrences)
- `TS7034`: Variable implicitly has 'any[]' type (5 occurrences)
- `TS7053`: Element implicitly has 'any' type (5+ occurrences)

**Solution:** Add explicit type annotations

---

## 🎨 Category 26: Miscellaneous Type Errors (20+ errors)

- Delete operator issues (readonly properties)
- Computed property name errors
- Symbol iterator missing
- Translation key type mismatches
- Default value initialization issues

---

## Summary by Priority

### 🟢 High Priority (Can Fix Immediately)
1. ✅ Unused variables/imports (49 errors) - **FIXING NOW**
2. Missing file error (1 error)
3. Icon props issues (2 errors)
4. Generic type parameters (2 errors)

### 🟡 Medium Priority (Need Investigation)
5. API response type mismatches (20 errors)
6. Customer group types (15 errors)
7. Order table query (1 error)
8. Tax types (4 errors)
9. Query key factory (2 errors)

### 🔴 Low Priority (Complex, May Need Breaking Changes)
10. Product type issues (50+ errors)
11. Inventory type issues (10+ errors)
12. Order/fulfillment issues (100+ errors)
13. Price/promotion issues (30+ errors)
14. Region/location issues (15+ errors)
15. Metadata forms (5 errors)
16. Form/input mismatches (10+ errors)
17. All other categories (50+ errors)

---

## Recommended Approach

1. ✅ **Fix unused variables/imports** (automated cleanup)
2. **Create missing files or remove references**
3. **Fix simple type assertions** (icons, generics, forwardRef)
4. **Document complex issues** that need architectural decisions
5. **Create type mapping utilities** for commonly mismatched types
6. **Gradually address by feature area** (orders, products, etc.)

