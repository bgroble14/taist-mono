# Frontend-Only Tasks - Detailed Implementation Plan

This document contains detailed implementation plans for all incomplete frontend-only tasks from Sprint 1.

---

## TMA-004: Simple Tutorial Overhaul
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
Make the chef onboarding tutorial more visually appealing with better pictures, improved styling, and prevent chefs from skipping it.

### Files to Modify

#### 1. Chef Onboarding Screen
**File:** `frontend/app/screens/chef/onboarding/index.tsx`  
**Current State:** Lines 1-160 contain basic onboarding flow  
**Current Issues:**
- Uses placeholder images (line 73, 81, 89, 98: `onboarding.jpg`)
- Can be skipped (navigation goes directly to tabs on line 37)
- Text is functional but not visually appealing (lines 75-102)

**Changes Needed:**

1. **Prevent Skipping:**
   - Remove ability to navigate away until onboarding is complete
   - Add completion tracking in Redux or AsyncStorage
   - Only show onboarding on first chef login

2. **Add Better Images:**
   - Replace placeholder images with actual screenshots/photos:
     - Step 1: Profile setup screenshot
     - Step 2: Menu creation screenshot  
     - Step 3: Profile completion screenshot
     - Step 4: Stripe setup screenshot
     - Step 5: Success/ready to cook image

3. **Improve Styling:**
   - Update `frontend/app/screens/chef/onboarding/styles.ts`
   - Add gradient backgrounds
   - Better typography hierarchy
   - Add progress indicators
   - Use theme colors consistently

#### 2. Onboarding Styles
**File:** `frontend/app/screens/chef/onboarding/styles.ts`  
**Changes:**
- Modernize card design with shadows
- Add progress bar/dots
- Better spacing and padding
- Professional color scheme

#### 3. Navigation Logic
**File:** `frontend/app/screens/chef/onboarding/index.tsx` line 37  
**Current:**
```typescript
} else {
  navigate.toChef.tabs();
}
```
**Change to:**
```typescript
} else {
  // Mark onboarding as complete
  await markOnboardingComplete();
  navigate.toChef.tabs();
}
```

### Implementation Steps
1. Create/source 5 high-quality images for each step
2. Update image assets in `frontend/app/assets/images/`
3. Redesign styles with modern UI patterns
4. Add onboarding completion tracking
5. Add validation to ensure steps are completed

---

## TMA-005: Overall Styling Overhaul
**Status:** In Progress  
**Complexity:** 🔴 Complex

### Overview
Comprehensive styling improvements across the entire application for a more modern, polished look.

### Scope
This is a large task affecting multiple screens. Priority areas based on user visibility:

### High Priority Screens

#### 1. Customer Home Screen
**File:** `frontend/app/screens/customer/home/index.tsx` + `styles.ts`  
**Improvements:**
- Chef cards design (lines 318-330)
- Filter button styling (lines 287-297, 301-316)
- Calendar component styling
- Empty state design (lines 331-336)

#### 2. Chef Cards Component
**File:** `frontend/app/screens/customer/home/components/chefCard.tsx`  
**Improvements:**
- Card shadows and borders
- Image styling with overlays
- Rating display enhancement
- Better spacing and typography

#### 3. Order Screens
**Files:**
- `frontend/app/screens/customer/orderDetail/index.tsx`
- `frontend/app/screens/chef/orderDetail/index.tsx`
**Improvements:**
- Receipt styling (lines 332-360 in chef detail)
- Status badges
- Button designs
- Price display formatting

#### 4. Navigation Tabs
**Files:**
- `frontend/app/screens/customer/(tabs)/_layout.tsx`
- `frontend/app/screens/chef/(tabs)/_layout.tsx`
**Improvements:**
- Tab bar styling (lines 20-31)
- Icon colors and sizes
- Active state indicators

### Theme System
**File:** `frontend/constants/theme.ts`  
**Updates Needed:**
- Expand color palette
- Define consistent shadows
- Typography scale
- Spacing system
- Border radius standards

### Approach
1. Update theme constants first
2. Create reusable styled components
3. Update screens systematically by priority
4. Ensure consistency across customer/chef sides
5. Test on both iOS and Android

---

## TMA-011: Calendar Overhaul
**Status:** Not Started  
**Complexity:** 🟡 Moderate

### Overview
Redesign the calendar component for better UX and visual appeal. Currently functional but basic.

### Files to Modify

#### 1. Customer Calendar Components
**Files:**
- `frontend/app/screens/customer/home/components/customCalendar.tsx`
- `frontend/app/screens/customer/checkout/components/customCalendar.tsx`

**Current State:**
- Basic week view with arrows (lines 73-136)
- Minimal styling (lines 139-204)
- Works but looks plain

**Improvements Needed:**
1. **Visual Design:**
   - Better day/date containers with gradients
   - Highlight today's date differently
   - Better disabled state styling
   - Add smooth transitions/animations

2. **UX Enhancements:**
   - Add month selector
   - Show availability indicators
   - Better touch feedback
   - Larger touch targets

3. **Styling Updates:**
   ```typescript
   // Update styles (lines 139-204)
   selectedDayContainer: {
     backgroundColor: '#ffffff',
     // Add shadow, gradient, or border
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   ```

#### 2. Chef Calendar Component
**File:** `frontend/app/screens/chef/orders/components/customCalendar.tsx`  
**Similar improvements as customer calendar**

### Design Specifications
- Use consistent design across all calendar instances
- Match overall app theme
- Consider using a calendar library like `react-native-calendars` for advanced features
- Add month view option
- Better visual hierarchy

---

## TMA-013: Show Current Location on Home Tab
**Status:** Not Started  
**Complexity:** 🟢 Simple

### Overview
Display the user's current location/city on the customer home screen so they know where chefs are being shown from.

### Files to Modify

#### 1. Customer Home Screen
**File:** `frontend/app/screens/customer/home/index.tsx`

**Current State:**
- User location is already stored: `self.zip` (line 52)
- Geolocation is tracked: `self.latitude`, `self.longitude` (already in user object)
- ZIP code validation exists (line 52)

**Implementation:**
Add location display near the top of the home screen (around line 265):

```typescript
// Add after line 265, before the calendar or at the top
{isInArea && (
  <View style={styles.locationDisplay}>
    <FontAwesomeIcon icon={faLocationDot} size={16} color="#ffffff" />
    <Text style={styles.locationText}>
      {self.city || 'Your Location'}, {self.state || self.zip}
    </Text>
  </View>
)}
```

**Styling:**
```typescript
// Add to styles.ts
locationDisplay: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
  paddingHorizontal: 12,
  paddingVertical: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 8,
},
locationText: {
  color: '#ffffff',
  fontSize: 14,
  fontWeight: '600',
},
```

### Additional Features (Optional)
- Add "Change Location" button
- Show distance radius (e.g., "Showing chefs within 10 miles")
- Reverse geocode coordinates to show city/neighborhood name

---

## TMA-019: Order Receipt for Chef Doesn't Show Added Customizations
**Status:** Not Started  
**Complexity:** 🟢 Simple

### Overview
The chef's order detail view shows items but doesn't display the customizations text inline with the menu item name.

### Files to Modify

#### 1. Chef Order Detail Screen
**File:** `frontend/app/screens/chef/orderDetail/index.tsx`

**Current Issue:**
- Lines 332-360: Order items are displayed
- Line 338: Only shows `item.name` (menu item name)
- Customizations are parsed but not displayed properly

**Current Code:**
```typescript
// Lines 336-340
{items.map((item, idx) => (
  <Text style={styles.text} key={`name_${idx}`}>
    {item.name}
  </Text>
))}
```

**Fix:**
The customizations need to be shown under the menu item. Looking at the data processing logic earlier in the file, customizations should already be in the `items` array.

**Solution:**
Update the display to show customizations:

```typescript
// Replace lines 336-340
{items.map((item, idx) => (
  <View key={`name_${idx}`}>
    <Text style={styles.text}>{item.name}</Text>
    {item.isCustomization && (
      <Text style={styles.customizationText}>  + {item.name}</Text>
    )}
  </View>
))}
```

OR better yet, group them like the customer version:

```typescript
// Show customizations inline like in customer screens
{items.map((item, idx) => (
  <Text style={styles.text} key={`name_${idx}`}>
    {item.name}
    {item.customizations && item.customizations.length > 0 && (
      `\n  Customizations: ${item.customizations.join(', ')}`
    )}
  </Text>
))}
```

**Reference:**
Customer order item component shows customizations correctly:  
`frontend/app/screens/customer/checkout/components/orderItem.tsx` lines 24-28:
```typescript
{names_customizations.length > 0 && (
  <Text style={styles.checkoutSummaryItemAddon} numberOfLines={1}>
    {`Customizations: ${names_customizations.join(' & ')} `}
  </Text>
)}
```

Apply similar pattern to chef order detail.

---

## TMA-021: From Order Date Selection, ONLY Able to Tap Back Button to Return to Current Day
**Status:** Not Started  
**Complexity:** 🟢 Simple

### Overview
When users navigate through calendar dates, they need an easier way to return to today's date besides repeatedly tapping the back arrow.

### Files to Modify

#### 1. Customer Checkout Calendar
**File:** `frontend/app/screens/customer/checkout/components/customCalendar.tsx`

**Current State:**
- Lines 76-92: Header with prev/next navigation arrows
- Line 84: Shows month/year text (not interactive)
- No "Today" button

**Implementation:**
Add a "Today" button that jumps back to current date:

```typescript
// Update header section (lines 76-92)
<View style={styles.header}>
  <TouchableOpacity 
    style={styles.navButton}
    onPress={() => navigateWeek('prev')}
  >
    <Text style={styles.navButtonText}>{'<'}</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    onPress={handleTodayPress}
    style={styles.todayButton}
  >
    <Text style={styles.monthYearText}>{monthYearText}</Text>
    <Text style={styles.todayButtonText}>Today</Text>
  </TouchableOpacity>
  
  <TouchableOpacity 
    style={styles.navButton}
    onPress={() => navigateWeek('next')}
  >
    <Text style={styles.navButtonText}>{'>'}</Text>
  </TouchableOpacity>
</View>
```

**Add handler function:**
```typescript
// Add around line 46
const handleTodayPress = () => {
  const today = moment();
  if (isDateSelectable(today)) {
    onDateSelect(today);
  }
};
```

**Add styles:**
```typescript
// Add to styles (after line 163)
todayButton: {
  alignItems: 'center',
  gap: 2,
},
todayButtonText: {
  color: '#ffffff',
  fontSize: 12,
  opacity: 0.7,
},
```

#### 2. Apply to All Calendar Instances
Apply the same pattern to:
- `frontend/app/screens/customer/home/components/customCalendar.tsx`
- `frontend/app/screens/chef/orders/components/customCalendar.tsx`

### Alternative Approach
Instead of making month/year text clickable, add a separate "Today" pill button on the right side of the header.

---

## TMA-025: Change "Special Requests" to "Special Instructions"
**Status:** Not Started  
**Complexity:** 🟢 Very Simple

### Overview
Simple text change from "Special Requests" to "Special Instructions" throughout the app for clarity.

### Files to Modify

#### 1. Add to Order Screen
**File:** `frontend/app/screens/customer/addToOrder/index.tsx`

**Line 162:**
```typescript
// BEFORE
placeholder="Enter any Special Requests "

// AFTER
placeholder="Enter any Special Instructions "
```

#### 2. Order Item Component
**File:** `frontend/app/screens/customer/checkout/components/orderItem.tsx`

**Line 32:**
```typescript
// BEFORE
numberOfLines={1}>{`Special Request: ${props.order.notes} `}</Text>

// AFTER
numberOfLines={1}>{`Special Instructions: ${props.order.notes} `}</Text>
```

#### 3. Search for All Instances
Run a search to find any other occurrences:
```bash
grep -r "Special Request" frontend/
```

Update all found instances to "Special Instructions"

### Files Found:
- `frontend/app/screens/customer/addToOrder/index.tsx` (line 162)
- `frontend/app/screens/customer/checkout/components/orderItem.tsx` (line 32)

Possibly others in:
- Order detail screens
- Chef order views
- Any forms or labels

---

## Task Ranking: Easiest to Hardest

### 🟢 Level 1: Very Simple (< 30 minutes)
1. **TMA-025** - Change "Special Requests" to "Special Instructions" ✅ COMPLETED
   - Just text replacements
   - 2-3 files
   - No logic changes

### 🟢 Level 2: Simple (< 2 hours)
2. **TMA-013** - Show Current Location on Home Tab ✅ COMPLETED
   - Add one display component
   - Data already available
   - Minimal styling

3. **TMA-019** - Order Receipt Customizations Display ✅ COMPLETED
   - Fix data display in one screen
   - Logic already exists, just not shown
   - Reference implementation available

4. **TMA-021** - Calendar "Today" Button ✅ COMPLETED
   - Add button to existing component
   - Simple navigation logic
   - Copy to 3 calendar instances

### 🟡 Level 3: Moderate (2-8 hours)
6. **TMA-004** - Tutorial Overhaul
   - Multiple screens and components
   - Need new images/assets
   - Styling updates
   - Add skip prevention logic
   - Completion tracking

7. **TMA-011** - Calendar Overhaul
   - Redesign existing component
   - Multiple calendar instances to update
   - Complex styling improvements
   - Consider UX enhancements
   - Test across different date ranges

### 🔴 Level 4: Complex (8+ hours)
5. **TMA-005** - Overall Styling Overhaul
   - Touches many files
   - Requires design system thinking
   - Need consistent theme updates
   - Multiple screens affected
   - Must maintain existing functionality
   - Requires extensive testing

---

## Recommended Implementation Order

### Phase 1: Quick Wins (Complete in 1 day)
1. TMA-025 (30 min)
2. TMA-013 (1-2 hours)
3. TMA-019 (1-2 hours)
4. TMA-003 (1 hour)
5. TMA-021 (2 hours)

**Total: ~6-7 hours**

### Phase 2: Medium Tasks (2-3 days)
6. TMA-004 - Tutorial Overhaul (4-6 hours)
7. TMA-011 - Calendar Overhaul (4-6 hours)

**Total: ~8-12 hours**

### Phase 3: Major Project (1-2 weeks)
8. TMA-005 - Overall Styling Overhaul (20-40 hours)
   - Break into smaller sub-tasks
   - Do screen by screen
   - Coordinate with design team

**Total: ~20-40 hours**

---

## Notes

- All tasks are frontend-only and require no backend changes
- No database migrations needed
- Can be developed and tested locally
- Each task can be done independently
- Consider creating feature branches for each task
- Test on both iOS and Android
- Verify changes with stakeholders before considering complete

## Dependencies

- TMA-005 (Styling Overhaul) should be done after the other tasks since it will touch the same files
- Consider doing TMA-004 and TMA-011 together since they both involve visual improvements
- Quick wins (Phase 1) can be done in any order

---

*Last Updated: December 1, 2025*

