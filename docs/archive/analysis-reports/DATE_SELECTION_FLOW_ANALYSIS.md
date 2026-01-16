# Date Selection Flow Analysis

## Issue Summary

**Reported Bug:** User selects Monday on the Home tab, but when navigating to Checkout, the date reverts to the previous Friday.

**Root Cause:** The selected date is not passed through the navigation flow. Only the weekday number (0-6) is passed, and Checkout ignores it entirely, defaulting to "first available working day from today."

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Complete Data Flow Diagram](#complete-data-flow-diagram)
3. [Screen-by-Screen Analysis](#screen-by-screen-analysis)
4. [The Bug: Step-by-Step Breakdown](#the-bug-step-by-step-breakdown)
5. [Code Evidence](#code-evidence)
6. [Entry Points to Checkout](#entry-points-to-checkout)
7. [Related Systems](#related-systems)
8. [Recommended Fix](#recommended-fix)

---

## Executive Summary

### What's Happening

| Step | Screen | What Gets Passed | What Gets Used |
|------|--------|------------------|----------------|
| 1 | Home | User selects Monday Dec 30 | `DAY = moment("2024-12-30")` |
| 2 | Home → ChefDetail | `weekDay: 1` (Monday) | Stored but not displayed |
| 3 | ChefDetail → Checkout | `weekDay: 1` (Monday) | **IGNORED** |
| 4 | Checkout | Calculates own date | `findFirstWorkingDay()` from today |

### The Problem

1. **Only `weekDay` (0-6) is passed** - Not the actual date string
2. **Checkout ignores the passed `weekDay`** - Uses `findFirstWorkingDay()` instead
3. **`findFirstWorkingDay()` starts from TODAY** - Not from the user's selected date

### Why Friday Appears

If today is Friday Dec 27 and user selected Monday Dec 30:
- Checkout calls `findFirstWorkingDay()`
- Starts from today (Friday Dec 27)
- Chef works Fridays → Friday matches first!
- Returns Friday Dec 27 instead of Monday Dec 30

---

## Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HOME SCREEN                                     │
│  frontend/app/screens/customer/home/index.tsx                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  State: DAY = moment()  ← Full date object (e.g., "2024-12-30")            │
│                                                                             │
│  User taps Monday Dec 30 → handleDayPress(day) → onChangeDAY(day)          │
│                                                                             │
│  API Call: GetSearchChefAPI({                                               │
│    week_day: DAY.weekday(),        // 1 (Monday)                           │
│    selected_date: DAY.format('YYYY-MM-DD'),  // "2024-12-30" ✓            │
│    timezone_gap: moment().utcOffset() / 60                                  │
│  })                                                                         │
│                                                                             │
│  Navigation to ChefDetail:                                                  │
│    weekDay: DAY.weekday()  // Only passes 1, NOT "2024-12-30" ✗            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CHEF DETAIL SCREEN                                 │
│  frontend/app/screens/customer/chefDetail/index.tsx                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Receives: weekDay = parseInt(params.weekDay)  // Just the number 1        │
│                                                                             │
│  Does NOT use weekDay for anything on this screen                          │
│  Does NOT display the selected date                                         │
│                                                                             │
│  On Checkout button:                                                        │
│    Passes: weekDay: weekDay.toString()  // Still just "1"                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CHECKOUT SCREEN                                   │
│  frontend/app/screens/customer/checkout/index.tsx                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Receives: weekDay = parseInt(params.weekDay)  // 1                        │
│            chefProfile = JSON.parse(params.chefProfile)                     │
│                                                                             │
│  IGNORES weekDay for date selection!                                        │
│                                                                             │
│  useEffect on mount:                                                        │
│    const findFirstWorkingDay = () => {                                      │
│      const today = moment().startOf('day');  // Starts from TODAY          │
│      for (let i = 0; i < 30; i++) {                                        │
│        const checkDate = today.clone().add(i, 'days');                     │
│        if (chefWorkingDays.includes(checkDate.weekday())) {                │
│          return checkDate;  // Returns FIRST match, not user's date        │
│        }                                                                    │
│      }                                                                      │
│    };                                                                       │
│    onChangeDay(findFirstWorkingDay());                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Screen-by-Screen Analysis

### 1. Home Screen

**File:** `frontend/app/screens/customer/home/index.tsx`

#### Date State Management

```typescript
// Line 40: Primary date state - stores FULL moment object
const [DAY, onChangeDAY] = useState(moment());
```

#### Calendar Component

```typescript
// Lines 292-297: Calendar receives full moment object
<CustomCalendar
  selectedDate={DAY}           // Full moment object
  onDateSelect={handleDayPress}
  minDate={startDate}
  maxDate={endDate}
/>
```

#### Day Selection Handler

```typescript
// Lines 202-206
const handleDayPress = (day: moment.Moment) => {
  onChangeDAY(day);  // Updates state with full moment object
};
```

#### API Call (Correct Implementation)

```typescript
// Lines 100-118: API receives BOTH weekday AND full date
const loadData = useCallback(async (showSpinner = true) => {
  const week_day = DAY.weekday();                    // 0-6
  const selected_date = DAY.format('YYYY-MM-DD');    // "2024-12-30"
  const timezone_gap = moment().utcOffset() / 60;

  const searchChefs = await GetSearchChefAPI(
    { week_day, selected_date, category_id, time_slot, timezone_gap, user_id: self?.id || -1 },
    dispatch,
  );
});
```

#### Navigation to ChefDetail (BUG ORIGIN)

```typescript
// Lines 218-228: Only weekday number passed, NOT the full date
const handleChefDetail = (id: number) => {
  const chef = chefs.find(x => x.id === id);
  if (!chef) return;

  navigate.toCustomer.chefDetail({
    chefInfo: chef,
    reviews: chef.reviews,
    menus: chef.menus,
    weekDay: DAY.weekday(),  // ❌ Only passes 1, not "2024-12-30"
  });
};
```

---

### 2. Chef Detail Screen

**File:** `frontend/app/screens/customer/chefDetail/index.tsx`

#### Receiving Parameters

```typescript
// Line 60: Receives weekday as number
const weekDay: number = parseInt(params.weekDay as string);
```

#### Usage

The `weekDay` variable is:
- Stored in local scope
- NOT displayed anywhere on the screen
- NOT used for any filtering or logic on this screen
- Simply passed through to Checkout

#### Navigation to Checkout

```typescript
// Lines 116-126: Passes weekDay through unchanged
const handleCheckout = () => {
  router.push({
    pathname: '/screens/customer/(tabs)/(home)/checkout',
    params: {
      chefInfo: JSON.stringify(chefInfo),
      orders: JSON.stringify(chefOrders),
      weekDay: weekDay.toString(),           // Still just "1"
      chefProfile: JSON.stringify(chefProfile),
    }
  });
};
```

---

### 3. Checkout Screen

**File:** `frontend/app/screens/customer/checkout/index.tsx`

#### Receiving Parameters

```typescript
// Lines 64-67
const orders: Array<IOrder> = params.orders ? JSON.parse(params.orders as string) : [];
const chefInfo: IUser = params.chefInfo ? JSON.parse(params.chefInfo as string) : {};
const weekDay: number = params.weekDay ? parseInt(params.weekDay as string) : 0;
const chefProfile: IChefProfile = params.chefProfile ? JSON.parse(params.chefProfile as string) : {};
```

#### Chef Working Days Calculation

```typescript
// Lines 106-121: Determines which days chef works
const getChefWorkingDays = (): number[] => {
  const workingDays: number[] = [];
  if (hasValidTime(chefProfile.sunday_start)) workingDays.push(0);
  if (hasValidTime(chefProfile.monday_start)) workingDays.push(1);
  if (hasValidTime(chefProfile.tuesday_start)) workingDays.push(2);
  if (hasValidTime(chefProfile.wednesday_start)) workingDays.push(3);
  if (hasValidTime(chefProfile.thursday_start)) workingDays.push(4);
  if (hasValidTime(chefProfile.friday_start)) workingDays.push(5);
  if (hasValidTime(chefProfile.saterday_start)) workingDays.push(6);

  return workingDays.length > 0 ? workingDays : [weekDay]; // weekDay used ONLY as fallback
};
```

#### Initial Date Selection (THE BUG)

```typescript
// Lines 143-164: This is where the bug manifests
useEffect(() => {
  addTimes();
  getPaymentMethod();

  // Find the first available working day starting from today
  const findFirstWorkingDay = () => {
    const today = moment().startOf('day');     // ❌ Starts from TODAY
    for (let i = 0; i < 30; i++) {
      const checkDate = today.clone().add(i, 'days');
      if (chefWorkingDays.includes(checkDate.weekday())) {
        return checkDate;                       // ❌ Returns FIRST match
      }
    }
    return today;
  };
  onChangeDay(findFirstWorkingDay());           // ❌ Ignores user's selection

  // ...
}, []);
```

#### What `weekDay` Is Actually Used For

The `weekDay` parameter is ONLY used as a fallback when the chef profile has no working days defined:

```typescript
return workingDays.length > 0 ? workingDays : [weekDay]; // Fallback only
```

It is NEVER used to initialize the selected date.

---

### 4. Cart Screen

**File:** `frontend/app/screens/customer/cart/index.tsx`

#### Navigation to Checkout

```typescript
// Lines 49-92: Cart has DIFFERENT behavior - uses current day
const handleCheckout = async (chefId: number) => {
  // ...
  router.push({
    pathname: '/screens/customer/(tabs)/(home)/checkout',
    params: {
      chefInfo: JSON.stringify(chefInfo),
      orders: JSON.stringify(chefOrders),
      weekDay: new Date().getDay().toString(),  // Uses TODAY's weekday
      chefProfile: JSON.stringify(chefProfile),
    }
  });
};
```

**Note:** Cart uses `new Date().getDay()` which is the current day, not any user selection. This is actually more "correct" behavior since Cart has no date context.

---

## The Bug: Step-by-Step Breakdown

### Scenario

- Today is Friday, December 27, 2024
- User selects Monday, December 30, 2024 on Home screen
- Chef works Monday, Wednesday, Friday

### Step 1: Home Screen

```
User taps Monday Dec 30
  → DAY = moment("2024-12-30")
  → DAY.weekday() = 1
  → API called with selected_date: "2024-12-30" ✓
  → Chefs filtered for Dec 30 availability ✓
```

### Step 2: User Taps Chef Card

```
navigate.toCustomer.chefDetail({
  weekDay: DAY.weekday()  // Passes 1 (Monday)
                          // Does NOT pass "2024-12-30"
})
```

### Step 3: Chef Detail Screen

```
Receives weekDay = 1
Does nothing with it except pass it along
```

### Step 4: User Taps Checkout

```
router.push({
  weekDay: weekDay.toString()  // Passes "1"
  chefProfile: JSON.stringify(chefProfile)
})
```

### Step 5: Checkout Screen (BUG LOCATION)

```
Receives weekDay = 1
Receives chefProfile with working days [1, 3, 5] (Mon, Wed, Fri)

findFirstWorkingDay() executes:
  today = moment("2024-12-27")  // Friday

  i=0: checkDate = Dec 27 (Friday)
       Friday.weekday() = 5
       chefWorkingDays.includes(5) = TRUE ← MATCH!
       return Dec 27 (Friday)

  // Never checks Dec 28, 29, 30...

onChangeDay(Dec 27)  // Sets to Friday, not Monday!
```

### Result

User sees Friday Dec 27 selected instead of Monday Dec 30.

---

## Code Evidence

### Navigation Parameters Definition

**File:** `frontend/app/utils/navigation.ts`

```typescript
// Lines 103-116: chefDetail navigation
chefDetail: (params: {
  chefInfo: any;
  reviews: any[];
  menus: any[];
  weekDay: number;        // ❌ Only weekday, no date
}) => router.push({...})

// Lines 138-151: checkout navigation
checkout: (params: {
  orders: IOrder[];
  chefInfo: IUser;
  weekDay: number;        // ❌ Only weekday, no date
  chefProfile: any;
}) => router.push({...})
```

### Calendar Components Comparison

| Feature | Home Calendar | Checkout Calendar |
|---------|---------------|-------------------|
| File | `home/components/customCalendar.tsx` | `checkout/components/customCalendar.tsx` |
| Props | `selectedDate`, `onDateSelect`, `minDate`, `maxDate` | Same + `datesWhitelist` |
| Date Validation | All dates in range allowed | Only chef working days allowed |
| Swipe Support | Yes | Yes |
| Today Button | Yes | Yes |

The calendars are nearly identical, but Checkout adds a `datesWhitelist` prop to restrict selectable dates to chef working days.

---

## Entry Points to Checkout

There are **two** ways to reach the Checkout screen:

### 1. From Chef Detail (via Home)

```
Home → Chef Detail → Checkout
```

**Parameters passed:**
- `weekDay`: From Home's `DAY.weekday()`
- `chefProfile`: Fetched on Chef Detail screen

**Bug applies:** YES - selected date lost

### 2. From Cart

```
Cart → Checkout
```

**Parameters passed:**
- `weekDay`: `new Date().getDay()` (current day)
- `chefProfile`: Fetched on Cart screen

**Bug applies:** N/A - Cart has no date context to preserve

---

## Related Systems

### State Management (Redux)

**File:** `frontend/app/store/index.ts`

The selected date is NOT stored in Redux:

```typescript
const appReducer = combineReducers({
  user: userReducer,       // User info
  loading: loadingReducer, // Loading states
  table: tableReducer,     // Global data (users, menus, categories)
  customer: customerReducer, // Cart orders - NO DATE
  chef: chefReducer,
});
```

Cart orders in `customerReducer` store the items but NOT the selected date:

```typescript
interface CustomerState {
  orders: Array<IOrder>;  // No date field in pending orders
}
```

### API Date Handling

The API correctly receives the full date:

```typescript
// GetSearchChefAPI
{
  week_day: number,           // Day of week (0-6)
  selected_date: string,      // Full date "YYYY-MM-DD"
  timezone_gap: number,       // Timezone offset
}

// GetAvailableTimeslotsAPI
(chef_id: number, date: string)  // Full date "YYYY-MM-DD"

// CreateOrderAPI
{
  order_date: number,         // Unix timestamp (seconds)
}
```

---

## Recommended Fix

### Option 1: Pass Full Date Through Navigation (Recommended)

**Scope:** Minimal changes, targeted fix
**Complexity:** Low
**Risk:** Low - isolated changes, no state management modifications
**Estimated Files Changed:** 4 files, ~20 lines total

---

#### Deep Dive Analysis

##### Why This Is The Best Option

1. **Minimal Surface Area**: Only 4 files need changes
2. **No State Management Changes**: Redux store remains unchanged
3. **Backward Compatible**: `weekDay` can remain as fallback
4. **Already Established Pattern**: The API already uses `selected_date` string format

##### Complete File-by-File Changes

---

**File 1: `frontend/app/utils/navigation.ts`**

Current (Lines 103-116):
```typescript
chefDetail: (params: {
  chefInfo: any;
  reviews: any[];
  menus: any[];
  weekDay: number;
}) => router.push({
  pathname: '/screens/customer/(tabs)/(home)/chefDetail',
  params: {
    chefInfo: JSON.stringify(params.chefInfo),
    reviews: JSON.stringify(params.reviews),
    menus: JSON.stringify(params.menus),
    weekDay: params.weekDay.toString()
  }
} as any),
```

New:
```typescript
chefDetail: (params: {
  chefInfo: any;
  reviews: any[];
  menus: any[];
  weekDay: number;
  selectedDate: string;  // ADD: "YYYY-MM-DD" format
}) => router.push({
  pathname: '/screens/customer/(tabs)/(home)/chefDetail',
  params: {
    chefInfo: JSON.stringify(params.chefInfo),
    reviews: JSON.stringify(params.reviews),
    menus: JSON.stringify(params.menus),
    weekDay: params.weekDay.toString(),
    selectedDate: params.selectedDate  // ADD
  }
} as any),
```

Current (Lines 138-151):
```typescript
checkout: (params: {
  orders: IOrder[];
  chefInfo: IUser;
  weekDay: number;
  chefProfile: any;
}) => router.push({
  pathname: '/screens/customer/(tabs)/(home)/checkout',
  params: {
    orders: JSON.stringify(params.orders),
    chefInfo: JSON.stringify(params.chefInfo),
    weekDay: params.weekDay.toString(),
    chefProfile: JSON.stringify(params.chefProfile)
  }
} as any),
```

New:
```typescript
checkout: (params: {
  orders: IOrder[];
  chefInfo: IUser;
  weekDay: number;
  chefProfile: any;
  selectedDate?: string;  // ADD: Optional for backward compatibility with Cart
}) => router.push({
  pathname: '/screens/customer/(tabs)/(home)/checkout',
  params: {
    orders: JSON.stringify(params.orders),
    chefInfo: JSON.stringify(params.chefInfo),
    weekDay: params.weekDay.toString(),
    chefProfile: JSON.stringify(params.chefProfile),
    selectedDate: params.selectedDate || ''  // ADD: Empty string if not provided
  }
} as any),
```

---

**File 2: `frontend/app/screens/customer/home/index.tsx`**

Current (Lines 218-228):
```typescript
const handleChefDetail = (id: number) => {
  const chef = chefs.find(x => x.id === id);
  if (!chef) return;

  navigate.toCustomer.chefDetail({
    chefInfo: chef,
    reviews: chef.reviews,
    menus: chef.menus,
    weekDay: DAY.weekday(),
  });
};
```

New:
```typescript
const handleChefDetail = (id: number) => {
  const chef = chefs.find(x => x.id === id);
  if (!chef) return;

  navigate.toCustomer.chefDetail({
    chefInfo: chef,
    reviews: chef.reviews,
    menus: chef.menus,
    weekDay: DAY.weekday(),
    selectedDate: DAY.format('YYYY-MM-DD'),  // ADD: Full date string
  });
};
```

---

**File 3: `frontend/app/screens/customer/chefDetail/index.tsx`**

Current (Line 60):
```typescript
const weekDay: number = parseInt(params.weekDay as string);
```

New:
```typescript
const weekDay: number = parseInt(params.weekDay as string);
const selectedDate: string = params.selectedDate as string || '';  // ADD
```

Current (Lines 116-126):
```typescript
const handleCheckout = () => {
  router.push({
    pathname: '/screens/customer/(tabs)/(home)/checkout',
    params: {
      chefInfo: JSON.stringify(chefInfo),
      orders: JSON.stringify(chefOrders),
      weekDay: weekDay.toString(),
      chefProfile: JSON.stringify(chefProfile),
    }
  });
};
```

New:
```typescript
const handleCheckout = () => {
  router.push({
    pathname: '/screens/customer/(tabs)/(home)/checkout',
    params: {
      chefInfo: JSON.stringify(chefInfo),
      orders: JSON.stringify(chefOrders),
      weekDay: weekDay.toString(),
      chefProfile: JSON.stringify(chefProfile),
      selectedDate: selectedDate,  // ADD: Pass through the date
    }
  });
};
```

---

**File 4: `frontend/app/screens/customer/checkout/index.tsx`**

Current (Lines 64-67):
```typescript
const orders: Array<IOrder> = params.orders ? JSON.parse(params.orders as string) : [];
const chefInfo: IUser = params.chefInfo ? JSON.parse(params.chefInfo as string) : {};
const weekDay: number = params.weekDay ? parseInt(params.weekDay as string) : 0;
const chefProfile: IChefProfile = params.chefProfile ? JSON.parse(params.chefProfile as string) : {};
```

New:
```typescript
const orders: Array<IOrder> = params.orders ? JSON.parse(params.orders as string) : [];
const chefInfo: IUser = params.chefInfo ? JSON.parse(params.chefInfo as string) : {};
const weekDay: number = params.weekDay ? parseInt(params.weekDay as string) : 0;
const chefProfile: IChefProfile = params.chefProfile ? JSON.parse(params.chefProfile as string) : {};
const selectedDateParam: string = params.selectedDate as string || '';  // ADD
```

Current (Lines 143-164):
```typescript
useEffect(() => {
  addTimes();
  getPaymentMethod();

  // Find the first available working day starting from today
  const findFirstWorkingDay = () => {
    const today = moment().startOf('day');
    for (let i = 0; i < 30; i++) {
      const checkDate = today.clone().add(i, 'days');
      if (chefWorkingDays.includes(checkDate.weekday())) {
        return checkDate;
      }
    }
    return today; // Fallback
  };
  onChangeDay(findFirstWorkingDay());

  // Check if user has address, if not show modal
  if (!self.address || !self.city || !self.state || !self.zip) {
    setShowAddressModal(true);
  }
}, []);
```

New:
```typescript
useEffect(() => {
  addTimes();
  getPaymentMethod();

  // Find the first available working day starting from today
  const findFirstWorkingDay = () => {
    const today = moment().startOf('day');
    for (let i = 0; i < 30; i++) {
      const checkDate = today.clone().add(i, 'days');
      if (chefWorkingDays.includes(checkDate.weekday())) {
        return checkDate;
      }
    }
    return today; // Fallback
  };

  // NEW: Use passed date if valid, otherwise find first working day
  const initializeDate = () => {
    if (selectedDateParam) {
      const passedDate = moment(selectedDateParam, 'YYYY-MM-DD');
      // Validate: date is valid, not in past, and chef works that day
      if (passedDate.isValid() &&
          passedDate.isSameOrAfter(moment().startOf('day'), 'day') &&
          chefWorkingDays.includes(passedDate.weekday())) {
        console.log('[CHECKOUT] Using passed selectedDate:', selectedDateParam);
        return passedDate;
      }
      console.log('[CHECKOUT] Passed date invalid or chef unavailable, using fallback');
    }
    return findFirstWorkingDay();
  };
  onChangeDay(initializeDate());

  // Check if user has address, if not show modal
  if (!self.address || !self.city || !self.state || !self.zip) {
    setShowAddressModal(true);
  }
}, []);
```

---

##### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Valid future date, chef works | Use passed date ✓ |
| Valid future date, chef doesn't work | Fall back to `findFirstWorkingDay()` |
| Past date passed | Fall back to `findFirstWorkingDay()` |
| Invalid date string | Fall back to `findFirstWorkingDay()` |
| Empty/missing `selectedDate` | Fall back to `findFirstWorkingDay()` |
| Coming from Cart (no date context) | Fall back to `findFirstWorkingDay()` |

##### Cart Screen - No Changes Needed

The Cart screen (`cart/index.tsx`) doesn't need changes because:
1. Cart has no date selection context
2. `selectedDate` parameter is optional in checkout navigation
3. When empty, checkout falls back to `findFirstWorkingDay()` (current behavior)

##### AddToOrder Screen - No Changes Needed

The AddToOrder screen doesn't receive or need date context because:
1. It only adds items to the Redux cart
2. Date selection happens at checkout time
3. The date flows: Home → ChefDetail → Checkout (bypasses AddToOrder)

##### Testing Checklist

- [ ] Select Monday on Home, tap chef, checkout → Should show Monday
- [ ] Select Friday on Home, tap chef, checkout → Should show Friday
- [ ] Select past date (if possible) → Should fall back to first working day
- [ ] From Cart → Checkout → Should show first working day (no date context)
- [ ] Chef doesn't work on selected day → Should fall back to first working day

### Option 2: Store Selected Date in Redux

**Scope:** Larger change, more robust
**Complexity:** Medium
**Risk:** Medium - modifies state management, affects persistence
**Estimated Files Changed:** 6+ files, ~50 lines total

---

#### Deep Dive Analysis

##### Why Consider This Option

1. **Single Source of Truth**: Date selection lives in one place
2. **Survives Navigation**: Date persists even if user navigates away and back
3. **Benefits Cart Flow**: Cart → Checkout would also respect date selection
4. **Redux Persist**: Date would survive app restart (if desired)

##### Why This May Be Overkill

1. **More Complex**: Requires understanding Redux flow
2. **Persistence Concerns**: Do we want date to persist across app restarts?
3. **Stale Data**: User might see old date if they reopen app days later
4. **More Files Changed**: Touches Redux slice, store, multiple screens

##### Current Redux Architecture

```
frontend/app/store/index.ts
├── user: userSlice        → User profile info
├── loading: loadingSlice  → Loading spinner state
├── homeLoader: ...        → Home loading state
├── device: deviceSlice    → Device info
├── table: tableSlice      → Global data (users, menus, categories, orders)
├── customer: customerSlice → Cart orders (pending orders)
└── chef: chefSlice        → Chef-specific data
```

All reducers use `redux-persist` with `AsyncStorage`, meaning data survives app restarts.

##### Complete File-by-File Changes

---

**File 1: `frontend/app/reducers/customerSlice.ts`** (Modify existing)

Current:
```typescript
import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {IOrder} from '../types/index';

interface CustomerState {
  orders: Array<IOrder>;
}

const initialState: CustomerState = {
  orders: [],
};
```

New:
```typescript
import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {IOrder} from '../types/index';

interface CustomerState {
  orders: Array<IOrder>;
  selectedDate: string | null;  // ADD: "YYYY-MM-DD" or null
}

const initialState: CustomerState = {
  orders: [],
  selectedDate: null,  // ADD
};

// ADD new actions in reducers:
const customerSlicer = createSlice({
  name: 'Customer',
  initialState: initialState,
  reducers: {
    clearCustomer: state => {
      state.orders = [];
      state.selectedDate = null;  // ADD: Clear date on logout
    },
    addOrUpdateCustomerOrder: (state, action: PayloadAction<Array<IOrder>>) => {
      var arr = getNewArr([...state.orders], action.payload);
      state.orders = [...arr];
    },
    removeCustomerOrders: (state, action: PayloadAction<number>) => {
      const chefId = action.payload;
      const tmpArr = state.orders.filter(x => x.chef_user_id != chefId);
      state.orders = [...tmpArr];
    },
    // ADD: New actions for date management
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    clearSelectedDate: (state) => {
      state.selectedDate = null;
    },
  },
});

export const {
  clearCustomer,
  addOrUpdateCustomerOrder,
  removeCustomerOrders,
  setSelectedDate,      // ADD: Export
  clearSelectedDate,    // ADD: Export
} = customerSlicer.actions;
```

---

**File 2: `frontend/app/screens/customer/home/index.tsx`**

Add import:
```typescript
import { setSelectedDate } from '../../../reducers/customerSlice';
```

Update `handleDayPress`:
```typescript
const handleDayPress = (day: moment.Moment) => {
  onChangeDAY(day);
  dispatch(setSelectedDate(day.format('YYYY-MM-DD')));  // ADD: Sync to Redux
};
```

Optional - sync Redux → local state on mount (if user returns to Home):
```typescript
// At component top, read Redux date
const reduxDate = useAppSelector(x => x.customer.selectedDate);

useEffect(() => {
  // Sync Redux selectedDate to local state on mount
  if (reduxDate) {
    const parsedDate = moment(reduxDate, 'YYYY-MM-DD');
    if (parsedDate.isValid() && parsedDate.isSameOrAfter(moment(), 'day')) {
      onChangeDAY(parsedDate);
    }
  }
}, []);  // Only on mount
```

---

**File 3: `frontend/app/screens/customer/checkout/index.tsx`**

Add import:
```typescript
import { clearSelectedDate } from '../../../reducers/customerSlice';
```

Update initialization:
```typescript
// Get selected date from Redux
const reduxSelectedDate = useAppSelector(x => x.customer.selectedDate);

useEffect(() => {
  addTimes();
  getPaymentMethod();

  const findFirstWorkingDay = () => {
    const today = moment().startOf('day');
    for (let i = 0; i < 30; i++) {
      const checkDate = today.clone().add(i, 'days');
      if (chefWorkingDays.includes(checkDate.weekday())) {
        return checkDate;
      }
    }
    return today;
  };

  // NEW: Use Redux date if valid
  const initializeDate = () => {
    if (reduxSelectedDate) {
      const passedDate = moment(reduxSelectedDate, 'YYYY-MM-DD');
      if (passedDate.isValid() &&
          passedDate.isSameOrAfter(moment().startOf('day'), 'day') &&
          chefWorkingDays.includes(passedDate.weekday())) {
        console.log('[CHECKOUT] Using Redux selectedDate:', reduxSelectedDate);
        return passedDate;
      }
    }
    return findFirstWorkingDay();
  };
  onChangeDay(initializeDate());

  if (!self.address || !self.city || !self.state || !self.zip) {
    setShowAddressModal(true);
  }
}, []);

// Optional: Clear Redux date after successful order
const handleCheckoutProcess = async (day: Moment) => {
  // ... existing code ...
  if (isCreateSuccess) {
    dispatch(removeCustomerOrders(chefInfo.id ?? 0));
    dispatch(clearSelectedDate());  // ADD: Clear date after order
    goBack();
    navigate.toCustomer.orders();
  }
};
```

---

**File 4: `frontend/app/screens/customer/cart/index.tsx`** (Optional enhancement)

Now Cart can also benefit from the Redux date:
```typescript
// No changes needed to handleCheckout
// Checkout will read from Redux directly
```

---

**File 5: App Root (Handle stale dates)**

Since Redux Persist saves to AsyncStorage, the date survives app restarts. This could cause issues.

**Problem**: User selects Monday Dec 30, closes app, reopens on Jan 5 → sees stale Dec 30.

**Solution - Add to app initialization** (`frontend/app/_layout.tsx` or similar):
```typescript
import { store } from './store';
import { clearSelectedDate } from './reducers/customerSlice';
import moment from 'moment';

// On app start, clear stale dates
useEffect(() => {
  const savedDate = store.getState().customer.selectedDate;
  if (savedDate) {
    const parsedDate = moment(savedDate, 'YYYY-MM-DD');
    if (parsedDate.isBefore(moment().startOf('day'), 'day')) {
      store.dispatch(clearSelectedDate());
      console.log('[APP] Cleared stale selectedDate:', savedDate);
    }
  }
}, []);
```

---

##### Alternative: Exclude from Persistence

If you don't want the date to persist at all:

```typescript
// In frontend/app/store/index.ts
import { persistReducer } from 'redux-persist';

// Create a nested persist config for customer
const customerPersistConfig = {
  key: 'customer',
  storage: AsyncStorage,
  blacklist: ['selectedDate'],  // Don't persist selectedDate
};

const persistedCustomerReducer = persistReducer(
  customerPersistConfig,
  customerReducer
);

const appReducer = combineReducers({
  // ... other reducers
  customer: persistedCustomerReducer,  // Use nested persisted reducer
});
```

---

##### Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| User selects date on Home | Saved to Redux ✓ |
| User navigates to Checkout | Reads from Redux ✓ |
| User goes to Cart → Checkout | Reads from Redux ✓ |
| User closes/reopens app same day | Uses saved date ✓ |
| User closes/reopens app next day | Clears stale date ✓ |
| User completes order | Clears date ✓ |
| User logs out | Clears all customer state ✓ |

##### Pros vs Cons Summary

| Pros | Cons |
|------|------|
| Single source of truth | More complex implementation |
| Works for both Home→Checkout AND Cart→Checkout | Requires handling stale dates |
| Survives navigation back/forth | May persist when not wanted |
| Type-safe with Redux Toolkit | More files to modify |
| Could benefit future features | Overkill for this specific bug |

##### Testing Checklist

- [ ] Select Monday on Home → Date saved to Redux
- [ ] Navigate to Checkout → Uses Redux date
- [ ] From Cart → Checkout → Uses Redux date (if set previously)
- [ ] Complete order → Date cleared from Redux
- [ ] Close app, reopen same day → Date still valid
- [ ] Close app, reopen next week → Stale date cleared
- [ ] Logout → All customer state cleared

### Option 3: Use URL Search Params / Deep Linking

**Scope:** Medium change
**Complexity:** Medium-High
**Risk:** Medium - URL structure changes, deep link considerations
**Estimated Files Changed:** 4-5 files, ~30 lines total

---

#### Deep Dive Analysis

##### What This Means

Instead of (or in addition to) passing `selectedDate` through navigation params, encode it directly in the URL path or query string. This leverages Expo Router's built-in URL handling.

##### Current App URL Scheme

From `app.json`:
```json
{
  "scheme": "taistexpo",
  "experiments": {
    "typedRoutes": true
  }
}
```

This means the app supports deep links like:
- `taistexpo://screens/customer/(tabs)/(home)/checkout`
- `exp+taist-expo://...` (development)

##### How Expo Router Handles Params

Expo Router already converts navigation params to URL search params:

```typescript
// This navigation call:
router.push({
  pathname: '/screens/customer/(tabs)/(home)/checkout',
  params: {
    weekDay: '1',
    chefProfile: '{"monday_start": "09:00"}'
  }
});

// Internally becomes something like:
// /screens/customer/(tabs)/(home)/checkout?weekDay=1&chefProfile=%7B...%7D
```

##### Why This Option Is Essentially The Same As Option 1

**Key Insight**: In Expo Router, navigation params ARE URL search params under the hood.

When you use `router.push({ params: {...} })`, those params:
1. Are encoded in the URL
2. Are accessible via `useLocalSearchParams()`
3. Persist in browser history (web)
4. Can be used for deep linking

**So Option 3 is functionally identical to Option 1**, just with different framing.

##### When Option 3 Would Be Different

Option 3 would be distinct if you wanted to:

1. **Use path segments instead of query params**:
```typescript
// Instead of:
/checkout?selectedDate=2024-12-30

// Use:
/checkout/2024-12-30

// Requires dynamic route file:
// frontend/app/screens/customer/(tabs)/(home)/checkout/[selectedDate].tsx
```

2. **Support external deep links**:
```
taistexpo://checkout?selectedDate=2024-12-30&chefId=123
```

3. **Web URL sharing**:
```
https://taist.app/checkout?selectedDate=2024-12-30
```

##### Implementation (If Using Path Segments)

**File Structure Change**:
```
frontend/app/screens/customer/(tabs)/(home)/
├── checkout.tsx                    # Current (no date in path)
├── checkout/
│   ├── index.tsx                   # Default checkout (no date)
│   └── [selectedDate].tsx          # Dynamic route with date
```

**Dynamic Route File** (`[selectedDate].tsx`):
```typescript
import { useLocalSearchParams } from 'expo-router';
import Checkout from '../../checkout/index';

export default function CheckoutWithDate() {
  const { selectedDate } = useLocalSearchParams<{ selectedDate: string }>();

  // Pass selectedDate to the Checkout component
  return <Checkout initialDate={selectedDate} />;
}
```

**Navigation**:
```typescript
// Navigate with date in path
router.push(`/screens/customer/(tabs)/(home)/checkout/${DAY.format('YYYY-MM-DD')}`);

// Or use object form
router.push({
  pathname: '/screens/customer/(tabs)/(home)/checkout/[selectedDate]',
  params: { selectedDate: DAY.format('YYYY-MM-DD') }
});
```

##### Why This Is Probably Overkill

1. **URL Length**: Already passing large JSON objects (chefProfile, orders) - URL is already long
2. **No Deep Link Use Case**: Users don't share checkout URLs
3. **Expo Router Complexity**: Dynamic routes add file structure complexity
4. **Same Effect**: Query params (Option 1) achieve the same result simpler

##### Pros vs Cons Summary

| Pros | Cons |
|------|------|
| Clean URLs (if using path segments) | Adds file structure complexity |
| Supports deep linking | No current deep link use case |
| Web-friendly | URL already has large JSON params |
| Bookmarkable URLs | Overkill for mobile-only app |
| Type-safe with typed routes | More work than Option 1 for same result |

##### When To Choose This Option

Choose Option 3 only if:
- You need external deep linking to checkout with a specific date
- You're building a web version and want shareable URLs
- You want cleaner URL aesthetics (path vs query)

##### Recommendation

**Don't use Option 3.** It's functionally equivalent to Option 1 but adds complexity. The only benefit would be cleaner URLs for deep linking, which isn't a current requirement.

**If you do need deep linking later**, you can add it on top of Option 1 by:
1. Creating a dynamic route file
2. Reading the path param
3. Passing it to existing checkout logic

---

## Options Comparison Matrix

| Criteria | Option 1 (Nav Params) | Option 2 (Redux) | Option 3 (URL/Deep Link) |
|----------|----------------------|------------------|-------------------------|
| **Complexity** | Low | Medium | Medium-High |
| **Files Changed** | 4 | 6+ | 5+ |
| **Lines Changed** | ~20 | ~50 | ~30 |
| **Risk** | Low | Medium | Medium |
| **Persists Across Navigation** | Yes | Yes | Yes |
| **Survives App Restart** | No | Yes (with cleanup) | No |
| **Benefits Cart Flow** | No | Yes | No |
| **Deep Link Support** | No | No | Yes |
| **Recommended** | ✅ Yes | For future | No |

---

## Final Recommendation

**Use Option 1: Pass Full Date Through Navigation**

Reasons:
1. Simplest solution with minimal code changes
2. Fixes the reported bug directly
3. No state management complexity
4. No persistence/stale data concerns
5. Cart flow works fine as-is (uses first available day)

If Cart → Checkout date preservation becomes a requirement later, upgrade to Option 2.

---

## Files Affected Summary

| File | Line(s) | Issue |
|------|---------|-------|
| `home/index.tsx` | 222-228 | Only passes `weekDay`, not full date |
| `chefDetail/index.tsx` | 116-126 | Passes through `weekDay` unchanged |
| `checkout/index.tsx` | 143-158 | Ignores `weekDay`, uses `findFirstWorkingDay()` |
| `navigation.ts` | 103-151 | Type definitions lack `selectedDate` |
| `cart/index.tsx` | 74, 87 | Uses `new Date().getDay()` (no user selection) |

---

## Appendix: Time Format Reference

| Location | Format | Example |
|----------|--------|---------|
| Home state | `moment.Moment` | `moment("2024-12-30")` |
| Navigation param | `number` (weekday) | `1` |
| API request | `string` (YYYY-MM-DD) | `"2024-12-30"` |
| Chef profile times | `string` (HH:MM) or `number` (legacy timestamp) | `"09:00"` or `1234567890` |
| Order date | `number` (Unix seconds) | `1735574400` |

---

*Document generated: December 26, 2024*
