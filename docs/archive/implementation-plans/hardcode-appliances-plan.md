# Plan: Hardcode Kitchen Appliances in Frontend

## Problem
Kitchen appliances (Sink, Stove, Oven, Microwave, Charcoal Grill, Gas Grill) are currently stored in the database and fetched via API. This causes:
1. Migration headaches when updating the list (current issue: "Toaster" still showing)
2. Unnecessary API calls on app load
3. Data inconsistency between environments
4. Extra database maintenance

## Solution
Hardcode the appliance definitions in the frontend. The backend only needs to store the appliance IDs that chefs select for their menu items.

---

## Current State

### Files that use appliances:

| File | Usage |
|------|-------|
| `frontend/app/reducers/tableSlice.ts` | Stores `appliances` array from API |
| `frontend/app/services/api.ts` | `GetAppliancesAPI()` fetches from backend |
| `frontend/app/screens/chef/addMenuItem/steps/StepMenuItemKitchen.tsx` | Chef selects appliances for menu item |
| `frontend/app/screens/chef/addMenuItem/steps/StepMenuItemReview.tsx` | Displays selected appliance names |
| `frontend/app/screens/customer/checkout/index.tsx` | Shows required appliances for order |
| `frontend/app/types/index.ts` | `IAppliance` interface |

### Current Data Flow:
```
App Launch → GetAppliancesAPI() → Redux store → Components read from store
```

### Proposed Data Flow:
```
Components import APPLIANCES constant directly (no API, no Redux)
```

---

## Implementation Steps

### Step 1: Create Appliances Constant
**File:** `frontend/app/constants/appliances.ts` (new file)

```typescript
export interface IAppliance {
  id: number;
  name: string;
  image: string;
  emoji: string; // Fallback if image fails
}

export const APPLIANCES: IAppliance[] = [
  { id: 1, name: 'Sink', image: 'sink.png', emoji: '💧' },
  { id: 2, name: 'Stove', image: 'stove.png', emoji: '🍳' },
  { id: 3, name: 'Oven', image: 'oven.png', emoji: '🔥' },
  { id: 4, name: 'Microwave', image: 'microwave.png', emoji: '📻' },
  { id: 5, name: 'Charcoal Grill', image: 'charcoal_grill.png', emoji: '🍖' },
  { id: 6, name: 'Gas Grill', image: 'gas_grill.png', emoji: '🔥' },
];

// Helper to get appliance by ID
export const getApplianceById = (id: number): IAppliance | undefined => {
  return APPLIANCES.find(a => a.id === id);
};

// Helper to get appliances by IDs
export const getAppliancesByIds = (ids: number[]): IAppliance[] => {
  return APPLIANCES.filter(a => ids.includes(a.id));
};

// Helper to get appliance names by IDs
export const getApplianceNames = (ids: number[]): string[] => {
  return getAppliancesByIds(ids).map(a => a.name);
};
```

---

### Step 2: Update StepMenuItemKitchen.tsx
**File:** `frontend/app/screens/chef/addMenuItem/steps/StepMenuItemKitchen.tsx`

**Changes:**
- Remove: `const appliances = useAppSelector(x => x.table.appliances);`
- Add: `import { APPLIANCES } from '../../../../constants/appliances';`
- Replace `appliances.map(...)` with `APPLIANCES.map(...)`
- Remove the `applianceIcons` object (now in constant)

---

### Step 3: Update StepMenuItemReview.tsx
**File:** `frontend/app/screens/chef/addMenuItem/steps/StepMenuItemReview.tsx`

**Changes:**
- Remove: `const appliances = useAppSelector(x => x.table.appliances);`
- Add: `import { getAppliancesByIds } from '../../../../constants/appliances';`
- Change: `const selectedAppliances = appliances.filter(...)` → `const selectedAppliances = getAppliancesByIds(applianceIds);`

---

### Step 4: Update Customer Checkout
**File:** `frontend/app/screens/customer/checkout/index.tsx`

**Changes:**
- Remove: `const appliances = useAppSelector(x => x.table.appliances);`
- Add: `import { getApplianceById } from '../../../../constants/appliances';`
- Update `getAppliances()` function to use `getApplianceById()` instead of searching Redux store

---

### Step 5: Clean Up Redux & API

**File:** `frontend/app/reducers/tableSlice.ts`
- Remove `appliances` from `TablesState` interface
- Remove `appliances: []` from `initialState`
- Remove `state.appliances = []` from `clearTable`
- Remove `updateAppliances` reducer
- Remove from exports

**File:** `frontend/app/services/api.ts`
- Remove `GetAppliancesAPI` function
- Remove call to `GetAppliancesAPI` in `GetAllTables` (around line 213)
- Remove `updateAppliances` import

**File:** `frontend/app/types/index.ts`
- Remove `IAppliance` interface (now in constants file)
- Remove from exports

---

### Step 6: Update Type Imports
Search for any remaining imports of `IAppliance` from types and update to import from constants.

---

## Files to Modify (Summary)

| Action | File |
|--------|------|
| CREATE | `frontend/app/constants/appliances.ts` |
| MODIFY | `frontend/app/screens/chef/addMenuItem/steps/StepMenuItemKitchen.tsx` |
| MODIFY | `frontend/app/screens/chef/addMenuItem/steps/StepMenuItemReview.tsx` |
| MODIFY | `frontend/app/screens/customer/checkout/index.tsx` |
| MODIFY | `frontend/app/reducers/tableSlice.ts` |
| MODIFY | `frontend/app/services/api.ts` |
| MODIFY | `frontend/app/types/index.ts` |

---

## Backend Impact

**No backend changes required.** The backend still:
- Stores menu item `appliances` field as comma-separated IDs (e.g., "1,2,5")
- Does NOT need to serve the appliances list anymore
- Can optionally keep the `tbl_appliances` table for reference/admin purposes

---

## Testing Checklist

- [ ] Chef can create menu item and select appliances
- [ ] Chef can edit menu item and see previously selected appliances
- [ ] Review step shows correct appliance names
- [ ] Customer checkout shows required appliances for order
- [ ] App loads without calling GetAppliancesAPI
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## Rollback Plan

If issues arise:
1. Revert the frontend changes
2. Re-add the API call
3. Fix the database migration separately

---

## Future Considerations

- If appliances need to be admin-editable in the future, consider a hybrid approach: fetch from API but cache locally with fallback to hardcoded defaults
- Image URLs are relative paths - ensure backend still serves the images at `/assets/uploads/images/`
