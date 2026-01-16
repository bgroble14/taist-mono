# Android Keyboard Blocking Issue - Complete Your Profile Modal

## Executive Summary

On Android devices, when users tap form fields in the "Complete Your Profile" modal during checkout, the on-screen keyboard covers the bottom portion of the form. The modal does not scroll, making fields like State and ZIP Code inaccessible.

**Severity:** High - Blocks user from completing checkout
**Affected Component:** [AddressCollectionModal.tsx](../frontend/app/components/AddressCollectionModal.tsx)
**Affected Platform:** Android (iOS works due to `react-native-keyboard-manager`)

---

## Table of Contents

1. [Problem Description](#1-problem-description)
2. [Root Cause Analysis](#2-root-cause-analysis)
3. [Codebase Audit](#3-codebase-audit)
4. [Technical Deep Dive](#4-technical-deep-dive)
5. [Potential Solutions](#5-potential-solutions)
6. [Recommendation](#6-recommendation)
7. [Testing Checklist](#7-testing-checklist)
8. [Related Files](#8-related-files)

---

## 1. Problem Description

### User Experience Issue

When a customer attempts to checkout without a saved delivery address, the `AddressCollectionModal` appears. The modal contains:
- First Name (text input)
- Last Name (text input)
- "Use Current Location" button
- Street Address (text input)
- City (text input)
- State (dropdown with search)
- ZIP Code (text input)
- Save & Continue button
- Cancel button

**Problem:** On Android, when the user taps on any text input field:
1. The soft keyboard appears from the bottom of the screen
2. The modal stays fixed at its position (`justifyContent: 'flex-end'`)
3. The keyboard covers the City, State, ZIP Code fields and both action buttons
4. There is no way to scroll within the modal
5. Users cannot see what they're typing in lower fields
6. Users cannot tap the Save button to complete the form

### Visual Reference

From the provided screenshots:
- **Screenshot 1:** Modal displayed with all fields visible, keyboard hidden
- **Screenshot 2:** User typing in Street Address, keyboard visible, blocking State dropdown and ZIP Code field entirely

---

## 2. Root Cause Analysis

### Primary Cause: No ScrollView in Modal

The `AddressCollectionModal` uses a flat `View` structure without any scrolling capability:

```tsx
// AddressCollectionModal.tsx lines 189-288
<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalOverlay}>          {/* justifyContent: 'flex-end' */}
    <View style={styles.modalContent}>         {/* maxHeight: '90%', NO SCROLL */}
      <View style={styles.modalHeader}>...</View>
      <View style={styles.formContent}>        {/* Just a View with gap spacing */}
        {/* 6 form fields + location button - NOT SCROLLABLE */}
      </View>
      <View style={styles.buttonContainer}>...</View>
    </View>
  </View>
</Modal>
```

**Key Style Issues:**
```tsx
// AddressCollectionModal.tsx lines 292-306
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',  // Modal anchored to bottom
},
modalContent: {
  backgroundColor: AppColors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: Spacing.lg,
  paddingHorizontal: Spacing.xl,
  paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
  maxHeight: '90%',  // Fixed max height, doesn't respond to keyboard
},
```

### Secondary Cause: No KeyboardAvoidingView

Unlike other form screens in the app, this modal lacks any keyboard-aware wrapper:
- No `KeyboardAvoidingView`
- No custom keyboard handling
- No keyboard event listeners

### Tertiary Cause: iOS-Only Keyboard Solution

The app uses `react-native-keyboard-manager` (IQKeyboardManager), which only works on iOS:

```tsx
// _layout.tsx lines 37-39
if (Platform.OS === 'ios') {
  KeyboardManager.setEnable(true);  // Only enabled for iOS
}
```

This means iOS users get automatic keyboard handling, but Android users have no solution.

### Contributing Factor: Edge-to-Edge Mode

The app has `edgeToEdgeEnabled: true` in `app.json` line 35, with the `react-native-edge-to-edge` plugin. This changes how system insets work on Android and can interfere with `windowSoftInputMode="adjustResize"`.

### Contributing Factor: Modal Window Context

On Android, React Native `Modal` components render in a separate window/activity. This means:
- The `windowSoftInputMode="adjustResize"` from `AndroidManifest.xml` may not apply
- `KeyboardAvoidingView` can have inconsistent behavior inside modals
- The modal may not receive keyboard events properly

---

## 3. Codebase Audit

### 3.1 All Modals with Form Inputs

| Modal Location | Has Forms? | Keyboard Handling | Status |
|----------------|------------|-------------------|--------|
| [AddressCollectionModal.tsx](../frontend/app/components/AddressCollectionModal.tsx):190 | Yes (6 fields) | NONE | **BROKEN** |
| [StepBasicProfile.tsx](../frontend/app/screens/common/signup/steps/StepBasicProfile.tsx):106 | Yes (1 field) | NONE | At Risk |
| [StepChefPhone.tsx](../frontend/app/screens/common/signup/steps/StepChefPhone.tsx):106 | Yes (1 field) | NONE | At Risk |
| [Account.tsx](../frontend/app/screens/common/account/index.tsx):736 | Yes (1 field) | NONE | At Risk |
| [StepMenuItemDescription.tsx](../frontend/app/screens/chef/addMenuItem/steps/StepMenuItemDescription.tsx):183 | No (display only) | Has ScrollView | OK |
| [GoLiveToggle/index.tsx](../frontend/app/components/GoLiveToggle/index.tsx):240 | No (time picker) | N/A | OK |
| [DayRowComponent.tsx](../frontend/app/screens/chef/profile/component/dayRowComponent.tsx):139 | No (time picker) | N/A | OK |
| [DrawerModal/index.tsx](../frontend/app/components/DrawerModal/index.tsx):148 | No (navigation) | N/A | OK |

### 3.2 Keyboard Handling Patterns in Codebase

#### Pattern A: KeyboardAwareScrollView (Custom Component)

**Location:** [KeyboardAwareScrollView/index.tsx](../frontend/app/components/KeyboardAwareScrollView/index.tsx)

```tsx
// Platform-specific behavior
const behavior = Platform.OS === 'ios' ? 'padding' : 'height';

<KeyboardAvoidingView
  style={[{ flex: 1 }, style]}
  behavior={behavior}
  keyboardVerticalOffset={getKeyboardVerticalOffset()}
  enabled={Platform.OS === 'ios' || enableOnAndroid}
>
  <ScrollView
    contentContainerStyle={[{ flexGrow: 1, paddingBottom: 20 }, ...]}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    nestedScrollEnabled={true}
  >
    {children}
  </ScrollView>
</KeyboardAvoidingView>
```

**Used in:**
- [Account/index.tsx](../frontend/app/screens/common/account/index.tsx):515 - Full page form
- [Chat/index.tsx](../frontend/app/screens/common/chat/index.tsx) - Message input

#### Pattern B: SignupStepContainer

**Location:** [SignupStepContainer.tsx](../frontend/app/screens/common/signup/components/SignupStepContainer.tsx)

```tsx
<KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}  // Android disabled!
  keyboardVerticalOffset={0}
>
  <ScrollView
    contentContainerStyle={styles.scrollContent}  // paddingBottom: 100
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    nestedScrollEnabled={true}
  >
```

**Issue:** `behavior` is `undefined` on Android, effectively disabling keyboard avoidance.

#### Pattern C: MenuItemStepContainer

**Location:** [MenuItemStepContainer.tsx](../frontend/app/screens/chef/addMenuItem/components/MenuItemStepContainer.tsx)

```tsx
<KeyboardAvoidingView
  style={styles.container}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // Android uses 'height'
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>
  <ScrollView
    contentContainerStyle={styles.scrollContent}  // flexGrow: 1, paddingBottom: Spacing.xl
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
```

**Better:** Uses `'height'` behavior on Android with a 20px offset.

### 3.3 Android-Specific Keyboard Configuration

**AndroidManifest.xml** ([frontend/android/app/src/main/AndroidManifest.xml](../frontend/android/app/src/main/AndroidManifest.xml):28):
```xml
<activity
  android:name=".MainActivity"
  android:windowSoftInputMode="adjustResize"
  ...
>
```

**app.json** ([frontend/app.json](../frontend/app.json):35):
```json
"android": {
  "edgeToEdgeEnabled": true,
  ...
}
```

**Conflict:** `edgeToEdgeEnabled` + `adjustResize` can cause unexpected behavior because edge-to-edge mode changes how window insets are calculated.

### 3.4 StyledTextInput Analysis

**Location:** [styledTextInput/index.tsx](../frontend/app/components/styledTextInput/index.tsx)

The component has a suspicious scroll hack that indicates previous keyboard issues:

```tsx
// Lines 67-74
const onFocus = () => {
  setFocused(true);
  setScrollEnabled(false);      // Disable scroll on focus
  setTimeout(() => {
    setScrollEnabled(true);     // Re-enable after 1 second
  }, 1000);
};
```

**Note:** The `scrollEnabled` state is defined but never actually used in the component. This appears to be dead code from a previous fix attempt.

### 3.5 SelectList Dropdown Behavior

**Package:** `react-native-dropdown-select-list` v2.0.5

The SelectList in AddressCollectionModal has these props:
```tsx
<SelectList
  dropdownProps={{ nestedScrollEnabled: true }}
  dropdownStyles={styles.dropdown}  // maxHeight: 250
  ...
/>
```

**Concerns:**
- Dropdown maxHeight is 250px - could be obscured by keyboard
- Search field in dropdown requires keyboard interaction
- No `keyboardShouldPersistTaps` configuration visible for internal ScrollView

---

## 4. Technical Deep Dive

### 4.1 Why Modals Are Problematic on Android

React Native `Modal` on Android creates a new `Dialog` window that:
1. Has its own window focus
2. May not inherit the activity's `windowSoftInputMode`
3. Creates a separate view hierarchy
4. Can have different behavior with `KeyboardAvoidingView`

The Android documentation states:
> "Soft input mode can be set on a per-window basis, which means a Dialog or other secondary window may have different keyboard behavior."

### 4.2 Edge-to-Edge Implications

With `edgeToEdgeEnabled: true`:
- Content can draw behind the navigation bar and status bar
- System window insets are handled differently
- `adjustResize` may not properly account for keyboard + navigation bar
- Apps need to manually apply `WindowInsetsCompat` for keyboard

### 4.3 Keyboard Event Flow

Current app keyboard event usage is minimal:
```typescript
// Only ONE explicit Keyboard API call in entire app:
// chef/profile/index.tsx line 292
Keyboard.dismiss();
```

No keyboard event listeners exist for:
- `keyboardDidShow` / `keyboardWillShow`
- `keyboardDidHide` / `keyboardWillHide`
- Dynamic height calculation

---

## 5. Potential Solutions

### Solution 1: Add ScrollView to AddressCollectionModal (Minimal Change)

**Approach:** Wrap the form content in a ScrollView.

**Changes Required:**
```tsx
// AddressCollectionModal.tsx
import { ScrollView } from 'react-native';

// Inside the component:
<View style={styles.modalContent}>
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    nestedScrollEnabled={true}
  >
    <View style={styles.modalHeader}>...</View>
    <View style={styles.formContent}>...</View>
    <View style={styles.buttonContainer}>...</View>
  </ScrollView>
</View>

// Add style:
scrollContent: {
  flexGrow: 1,
  paddingBottom: 20,
},
```

**Pros:**
- Minimal code change (< 10 lines)
- No new dependencies
- Users can scroll to see obscured fields

**Cons:**
- Doesn't auto-scroll to focused input
- Doesn't resize modal when keyboard appears
- SelectList dropdown may conflict with nested scroll

**Effort:** ~30 minutes
**Risk:** Low

---

### Solution 2: Use KeyboardAwareScrollView Component

**Approach:** Use the app's existing `KeyboardAwareScrollView` component inside the modal.

**Changes Required:**
```tsx
import KeyboardAwareScrollView from './KeyboardAwareScrollView';

<View style={styles.modalContent}>
  <KeyboardAwareScrollView
    contentContainerStyle={styles.scrollContent}
    keyboardVerticalOffset={Platform.OS === 'android' ? 20 : 0}
  >
    {/* form content */}
  </KeyboardAwareScrollView>
</View>
```

**Pros:**
- Uses existing tested component
- Consistent with Account screen pattern
- Better keyboard handling than plain ScrollView

**Cons:**
- `KeyboardAvoidingView` inside modals can be unreliable on Android
- May need to adjust `keyboardVerticalOffset` through testing
- Still doesn't auto-scroll to focused input

**Effort:** ~1 hour
**Risk:** Low-Medium

---

### Solution 3: Add KeyboardAvoidingView with Modal-Specific Config

**Approach:** Wrap the modal content in a `KeyboardAvoidingView` with Android-specific configuration.

**Changes Required:**
```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<Modal visible={visible} transparent animationType="slide">
  <KeyboardAvoidingView
    style={styles.modalOverlay}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'android' ? 50 : 0}
  >
    <View style={styles.modalContent}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* form content */}
      </ScrollView>
    </View>
  </KeyboardAvoidingView>
</Modal>
```

**Pros:**
- Native keyboard avoidance
- Modal resizes with keyboard

**Cons:**
- `KeyboardAvoidingView` has known issues inside modals
- May need extensive `keyboardVerticalOffset` tuning
- Edge-to-edge mode may interfere

**Effort:** ~2 hours
**Risk:** Medium

---

### Solution 4: Install react-native-keyboard-aware-scroll-view

**Approach:** Use the battle-tested third-party package that handles forms in modals.

**Installation:**
```bash
npm install react-native-keyboard-aware-scroll-view
```

**Changes Required:**
```tsx
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
        enableAutomaticScroll={true}
      >
        {/* form content */}
      </KeyboardAwareScrollView>
    </View>
  </View>
</Modal>
```

**Pros:**
- Well-maintained package (2M+ weekly downloads)
- Auto-scrolls to focused input
- Works well in modal contexts
- `enableOnAndroid` prop specifically for Android
- `extraScrollHeight` for fine-tuning

**Cons:**
- Adds dependency
- Potential confusion with existing custom `KeyboardAwareScrollView`
- May conflict with `react-native-keyboard-manager` on iOS

**Effort:** ~1-2 hours
**Risk:** Low

---

### Solution 5: Install react-native-avoid-softinput

**Approach:** Use `react-native-avoid-softinput` which is specifically designed for Android keyboard issues in modals.

**Installation:**
```bash
npm install react-native-avoid-softinput
cd ios && pod install  # If iOS support needed
```

**Changes Required:**
```tsx
import { AvoidSoftInputView } from 'react-native-avoid-softinput';

<Modal visible={visible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <AvoidSoftInputView
      avoidOffset={20}
      easing="easeIn"
      style={styles.modalContent}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* form content */}
      </ScrollView>
    </AvoidSoftInputView>
  </View>
</Modal>
```

**Alternative Hook API:**
```tsx
import { useSoftInputHeightChanged } from 'react-native-avoid-softinput';

const [keyboardHeight, setKeyboardHeight] = useState(0);
useSoftInputHeightChanged(({ softInputHeight }) => {
  setKeyboardHeight(softInputHeight);
});

// Use keyboardHeight to adjust modal position/padding
```

**Pros:**
- Purpose-built for this exact problem
- Works inside modals unlike `KeyboardAvoidingView`
- Provides both component and hook APIs
- Fine-grained control with `avoidOffset` and easing

**Cons:**
- New dependency
- Requires native rebuild
- Less popular than `react-native-keyboard-aware-scroll-view`
- May need to handle iOS separately

**Effort:** ~2-3 hours
**Risk:** Medium

---

### Solution 6: Full-Screen Modal on Android

**Approach:** Make the modal full-screen on Android, providing room for keyboard.

**Changes Required:**
```tsx
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Platform.OS === 'android' ? AppColors.background : 'rgba(0, 0, 0, 0.5)',
    justifyContent: Platform.OS === 'android' ? 'flex-start' : 'flex-end',
  },
  modalContent: {
    backgroundColor: AppColors.background,
    borderTopLeftRadius: Platform.OS === 'android' ? 0 : 24,
    borderTopRightRadius: Platform.OS === 'android' ? 0 : 24,
    paddingTop: Platform.OS === 'android' ? 60 : Spacing.lg,  // Account for status bar
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    maxHeight: Platform.OS === 'android' ? '100%' : '90%',
    height: Platform.OS === 'android' ? '100%' : undefined,
  },
});
```

**Pros:**
- Simple CSS-only change
- No new dependencies
- Guarantees all content is accessible
- More space for form fields

**Cons:**
- Different UX between platforms
- Doesn't feel like a "modal" on Android
- Loses bottom sheet interaction pattern
- Still needs ScrollView for keyboard scenarios

**Effort:** ~1 hour
**Risk:** Low

---

### Solution 7: Use @gorhom/bottom-sheet

**Approach:** Replace Modal with a proper bottom sheet library that handles keyboard natively.

**Installation:**
```bash
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```

**Changes Required:** Full component rewrite.

```tsx
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const AddressCollectionBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['90%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="interactive"      // Key prop for keyboard handling
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetScrollView>
        {/* form content */}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};
```

**Pros:**
- Professional bottom sheet behavior
- Built-in keyboard handling (`keyboardBehavior="interactive"`)
- Gesture-based dismissal
- Widely used in production apps
- Solves keyboard issue definitively

**Cons:**
- Major refactor of component
- New dependencies (if not already using)
- Different animation/interaction model
- Requires updating how modal is opened/closed
- Learning curve for configuration

**Effort:** ~4-8 hours
**Risk:** High (significant refactor)

---

### Solution 8: Manual Keyboard Event Handling

**Approach:** Listen to keyboard events and adjust modal position dynamically.

**Changes Required:**
```tsx
import { Keyboard, Animated, Platform } from 'react-native';

const [modalOffset] = useState(new Animated.Value(0));

useEffect(() => {
  if (Platform.OS !== 'android') return;

  const showListener = Keyboard.addListener('keyboardDidShow', (e) => {
    Animated.timing(modalOffset, {
      toValue: -e.endCoordinates.height / 2,  // Move modal up
      duration: 250,
      useNativeDriver: true,
    }).start();
  });

  const hideListener = Keyboard.addListener('keyboardDidHide', () => {
    Animated.timing(modalOffset, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  });

  return () => {
    showListener.remove();
    hideListener.remove();
  };
}, []);

// Apply transform to modal content
<Animated.View style={[styles.modalContent, { transform: [{ translateY: modalOffset }] }]}>
```

**Pros:**
- Full control over behavior
- No new dependencies
- Can customize animation
- Works for any modal

**Cons:**
- Complex implementation
- Needs testing across devices
- Manual handling of edge cases
- Must handle keyboard height variations

**Effort:** ~3-4 hours
**Risk:** Medium

---

## 6. Recommendation

### Recommended Approach: Solution 1 + Solution 4

**Phase 1 (Immediate Fix):** Add a simple ScrollView (Solution 1)
- Unblocks users immediately
- Minimal risk
- ~30 minutes to implement

**Phase 2 (Better UX):** Install `react-native-keyboard-aware-scroll-view` (Solution 4)
- Auto-scrolls to focused input
- Works reliably in modals
- Well-maintained package

### Implementation Order

1. **Quick Fix (Now):** Add `ScrollView` with `keyboardShouldPersistTaps="handled"`
2. **Test:** Verify on Android emulator and real device
3. **Install package:** Add `react-native-keyboard-aware-scroll-view`
4. **Replace:** Swap `ScrollView` for `KeyboardAwareScrollView`
5. **Test:** Verify auto-scroll behavior
6. **Cleanup:** Consider applying same pattern to other at-risk modals

### Code Changes for Quick Fix

```tsx
// AddressCollectionModal.tsx

// Add import
import { ScrollView } from 'react-native';

// Modify JSX (lines 196-286)
<View style={styles.modalContent}>
  <ScrollView
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    nestedScrollEnabled={true}
  >
    <View style={styles.modalHeader}>
      <Text style={styles.modalTitle}>Complete Your Profile</Text>
      <Text style={styles.modalSubtitle}>
        We need your name and delivery address to complete your order
      </Text>
    </View>

    <View style={styles.formContent}>
      {/* All existing form fields */}
    </View>

    <View style={styles.buttonContainer}>
      <StyledButton title="Save & Continue" onPress={validateAndSave} />
      <Pressable onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </Pressable>
    </View>
  </ScrollView>
</View>

// Add new styles
scrollView: {
  flex: 1,
},
scrollContent: {
  flexGrow: 1,
  paddingBottom: 20,
},
```

---

## 7. Testing Checklist

### Pre-Implementation Verification
- [ ] Reproduce issue on Android emulator (API 30+)
- [ ] Reproduce issue on physical Android device
- [ ] Confirm iOS works correctly (keyboard manager)
- [ ] Note exact fields obscured by keyboard

### Post-Implementation Testing
- [ ] Modal scrolls when keyboard is visible
- [ ] All form fields accessible with keyboard open
- [ ] First Name field - can type and see input
- [ ] Last Name field - can type and see input
- [ ] Street Address field - can type and see input
- [ ] City field - can type and see input
- [ ] State dropdown opens correctly
- [ ] State dropdown search works with keyboard
- [ ] State dropdown closes and selects value
- [ ] ZIP Code field - can type and see input (was most obscured)
- [ ] "Use Current Location" button accessible
- [ ] "Save & Continue" button accessible and works
- [ ] "Cancel" button accessible and works
- [ ] Modal dismisses properly on button press
- [ ] Modal dismisses on Android back button
- [ ] `keyboardShouldPersistTaps` allows tapping buttons with keyboard open
- [ ] Nested scroll works (modal scroll + state dropdown scroll)

### Device Matrix
- [ ] Android 10 (API 29) - emulator
- [ ] Android 11 (API 30) - emulator
- [ ] Android 12+ (API 31+) - real device
- [ ] Small screen (< 5.5")
- [ ] Large screen (> 6.5")
- [ ] Tablet (if supported)
- [ ] iOS (regression test - should still work)

### Edge Cases
- [ ] Very long address input
- [ ] Orientation change (if not locked)
- [ ] Rapid field switching
- [ ] Open modal, dismiss, reopen
- [ ] Fill form partially, dismiss, reopen (state preserved?)

---

## 8. Related Files

### Primary Files to Modify
- [AddressCollectionModal.tsx](../frontend/app/components/AddressCollectionModal.tsx) - Main component

### Reference Implementations
- [KeyboardAwareScrollView/index.tsx](../frontend/app/components/KeyboardAwareScrollView/index.tsx) - Existing keyboard solution
- [Account/index.tsx](../frontend/app/screens/common/account/index.tsx):515 - Uses KeyboardAwareScrollView correctly
- [MenuItemStepContainer.tsx](../frontend/app/screens/chef/addMenuItem/components/MenuItemStepContainer.tsx) - Good KeyboardAvoidingView pattern
- [SignupStepContainer.tsx](../frontend/app/screens/common/signup/components/SignupStepContainer.tsx) - Alternative pattern (Android behavior disabled)

### Configuration Files
- [AndroidManifest.xml](../frontend/android/app/src/main/AndroidManifest.xml):28 - `windowSoftInputMode="adjustResize"`
- [app.json](../frontend/app.json):35 - `edgeToEdgeEnabled: true`
- [_layout.tsx](../frontend/app/_layout.tsx):37-39 - iOS-only KeyboardManager setup
- [package.json](../frontend/package.json) - Dependencies

### Other At-Risk Modals (Apply Fix Later)
- [StepBasicProfile.tsx](../frontend/app/screens/common/signup/steps/StepBasicProfile.tsx):106 - Verification code modal
- [StepChefPhone.tsx](../frontend/app/screens/common/signup/steps/StepChefPhone.tsx):106 - Verification code modal
- [Account/index.tsx](../frontend/app/screens/common/account/index.tsx):736 - Verification code modal

---

## Appendix A: Android Keyboard Behavior Reference

### windowSoftInputMode Options

| Mode | Behavior |
|------|----------|
| `adjustResize` | Activity resizes to make room for keyboard |
| `adjustPan` | Activity pans to keep focused view visible |
| `adjustNothing` | No automatic adjustment |
| `adjustUnspecified` | System decides (default) |

Current app uses `adjustResize`, but this may not propagate to Modal windows.

### Edge-to-Edge Mode Impact

When edge-to-edge is enabled:
- App draws behind status bar and navigation bar
- `adjustResize` calculates available space differently
- Must use `WindowInsetsCompat` for proper keyboard inset handling
- React Native's built-in keyboard handling may not account for this

---

## Appendix B: Keyboard Package Comparison

| Package | Downloads/Week | Modal Support | Auto-Scroll | Android Support |
|---------|---------------|---------------|-------------|-----------------|
| react-native-keyboard-aware-scroll-view | 2.3M | Good | Yes | Yes |
| react-native-avoid-softinput | 90K | Excellent | No | Excellent |
| @gorhom/bottom-sheet | 500K | N/A (is a sheet) | Yes | Excellent |
| react-native-keyboard-manager | 50K | N/A | N/A | iOS Only |

---

## Appendix C: Similar Issues in React Native

- [react-native#17925](https://github.com/facebook/react-native/issues/17925) - KeyboardAvoidingView in Modal
- [react-native#29319](https://github.com/facebook/react-native/issues/29319) - Android keyboard issues
- [expo#15175](https://github.com/expo/expo/issues/15175) - Keyboard handling with edge-to-edge
