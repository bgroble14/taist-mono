# EAS Build Fix Plan: Missing Assets in Local Build

## Executive Summary

The EAS build is failing because **assets are being excluded from the build archive** due to a `.gitignore` rule that EAS CLI respects differently than git itself.

---

## Root Cause Analysis

### The Error
```
Unable to resolve module ../../assets/icons/Icon_Profile.png from
/private/.../frontend/app/components/styledProfileImage/index.tsx

None of these files exist:
  * Icon_Profile.png
  * app/assets/icons/Icon_Profile.png
```

### The Root Cause

**Line 21 in `.gitignore`:**
```
assets/
```

This pattern matches **any directory named `assets/`** anywhere in the repository. While git itself doesn't retroactively ignore already-tracked files, **EAS CLI's archive process respects `.gitignore` patterns even for tracked files**.

### Evidence

Running `eas build:inspect --stage archive` reveals:
```bash
ls /tmp/eas-archive-inspect/frontend/app/assets/
# Output: empty directory (only . and ..)
```

The `frontend/app/assets/icons/` and most of `frontend/app/assets/images/` are **not included** in the EAS build archive.

### Why Git Says Files Are Tracked

The files were committed **before** the `assets/` gitignore rule was added. Git doesn't un-track already committed files when you add them to `.gitignore`. However, EAS CLI's archive process uses `.gitignore` as a filter during packaging, regardless of git tracking status.

### Current Exceptions (Insufficient)

The `.gitignore` has exceptions for only 6 specific appliance images:
```gitignore
!frontend/app/assets/images/sink.png
!frontend/app/assets/images/stove.png
!frontend/app/assets/images/oven.png
!frontend/app/assets/images/microwave.png
!frontend/app/assets/images/toaster.png
!frontend/app/assets/images/grill.png
```

**Missing:**
- All files in `frontend/app/assets/icons/` (7 files)
- Most files in `frontend/app/assets/images/` (27 of 33 files)

---

## Impact Assessment

### Files Currently Missing from EAS Build

**Icons (all 7 missing):**
- `Icon_Profile.png` - Used in StyledProfileImage component
- `apple.png` - Apple sign-in button
- `google.png` - Google sign-in button
- `back.png` - Navigation back button
- `forward.png` - Navigation forward button
- `icon_invisible.png` - Password visibility toggle
- `icon_visible.png` - Password visibility toggle

**Images (27 of 33 missing):**
- `app_icon.png`
- `chef1.jpg`, `chef2.jpg`, `chef3.jpg`
- `chefDelivery.png`
- `gasGrill.png`, `charcoalGrill.png`
- `logo.png`, `logo-2.png`, `logo-with-background.png`
- `missing.png`
- `onboarding.jpg`, `onboarding_1.jpg`, `onboarding_2.jpg`, `onboarding_3.jpg`, `onboarding_end.png`
- `order.jpg`, `orders_empty.png`
- `splashLogo.png`
- `unlimit.png`

---

## Solution Options

### Option 1: Create `.easignore` (Recommended)

Create a `.easignore` file in the **monorepo root** (`/Users/williamgroble/taist-mono/.easignore`) that copies `.gitignore` but removes the `assets/` rule or adds proper exceptions.

**Pros:**
- Doesn't affect git behavior
- Clean separation of build vs version control concerns
- EAS CLI prioritizes `.easignore` over `.gitignore`

**Cons:**
- Need to maintain two ignore files

**Implementation:**
```bash
# Copy .gitignore to .easignore
cp .gitignore .easignore

# Edit .easignore to either:
# A) Remove the "assets/" line entirely, OR
# B) Add exceptions for all frontend assets:
#    !frontend/app/assets/
```

### Option 2: Fix `.gitignore` Exceptions

Add exceptions for all frontend assets to `.gitignore`.

**Implementation:**
```gitignore
# Temp assets (empty image files from clipboard)
assets/
# Exception: Frontend app assets needed for builds
!frontend/app/assets/
!frontend/app/assets/**
```

**Pros:**
- Single file to maintain
- Fixes both git and EAS behavior

**Cons:**
- May cause git to start tracking files you don't want
- The broad `!frontend/app/assets/**` might include unwanted files

### Option 3: Restructure the Gitignore Rule

Change the `assets/` rule to be more specific about what it's ignoring.

**Current (problematic):**
```gitignore
assets/
```

**Better:**
```gitignore
# Only ignore root-level assets directory (for temp clipboard files)
/assets/
```

The leading `/` makes it only match `assets/` at the repository root, not in subdirectories.

**Pros:**
- Minimal change
- Preserves original intent
- Fixes both git and EAS

**Cons:**
- May not match original intent if `assets/` was meant to be broad

---

## Recommended Solution

**Option 3 (Restructure gitignore) + Option 1 (.easignore) as backup**

### Step 1: Investigate Original Intent

The comment says "Temp assets (empty image files from clipboard)" - this suggests the rule was meant to ignore a specific temp directory, not all assets everywhere.

### Step 2: Fix the `.gitignore`

Change line 21 from:
```gitignore
assets/
```
To:
```gitignore
/assets/
```

Or more explicitly:
```gitignore
# Temp assets at repo root (empty image files from clipboard)
/assets/
```

### Step 3: Remove Unnecessary Exceptions

If using `/assets/`, you can remove the individual file exceptions (lines 23-34) as they're no longer needed - `frontend/app/assets/` won't match `/assets/`.

### Step 4: Verify the Fix

```bash
# Re-run EAS archive inspection
cd frontend
npx eas build:inspect --platform ios --stage archive --output /tmp/eas-test --profile preview

# Check that assets are included
ls /tmp/eas-test/frontend/app/assets/icons/
# Should show: Icon_Profile.png, apple.png, etc.
```

### Step 5: Retry the Build

```bash
GEM_HOME=~/.gem PATH="$GEM_HOME/bin:$PATH" eas build --platform ios --profile preview --local --clear-cache
```

---

## Alternative Quick Fix

If you need to build immediately without modifying `.gitignore`:

### Create `.easignore` Now

```bash
cd /Users/williamgroble/taist-mono

# Create .easignore from .gitignore
cp .gitignore .easignore

# Remove the problematic line (line 21) from .easignore
# Or add this at the end of .easignore:
echo "" >> .easignore
echo "# Include frontend assets for builds" >> .easignore
echo "!frontend/app/assets/" >> .easignore
echo "!frontend/app/assets/**" >> .easignore
```

---

## Files to Modify

1. **`.gitignore`** (recommended fix)
   - Line 21: Change `assets/` to `/assets/`
   - Optionally remove lines 23-34 (no longer needed)

2. **OR `.easignore`** (quick fix)
   - Create new file
   - Copy from `.gitignore`
   - Add `!frontend/app/assets/**` at end

---

## Testing Checklist

- [ ] Run `eas build:inspect --stage archive` and verify `frontend/app/assets/icons/Icon_Profile.png` exists
- [ ] Run `eas build --local` and verify Metro bundling succeeds
- [ ] Verify app icons and images display correctly in built app
- [ ] Verify all sign-in buttons show icons
- [ ] Verify profile placeholder images work

---

## References

- [EAS .easignore Documentation](https://docs.expo.dev/build-reference/easignore/)
- [GitHub Issue: eas build --local skips .gitignore files](https://github.com/expo/eas-cli/issues/2594)
- [DEV: EAS build reads your .gitignore file](https://dev.to/amanbhoria/eas-build-reads-your-gitignore-file-29c0)
- [EAS Build Archive Documentation](https://github.com/expo/fyi/blob/main/eas-build-archive.md)

---

## Summary

| Aspect | Details |
|--------|---------|
| **Root Cause** | `.gitignore` line `assets/` excludes all asset directories from EAS archive |
| **Affected Files** | 34+ image/icon files in `frontend/app/assets/` |
| **Best Fix** | Change `assets/` to `/assets/` in `.gitignore` |
| **Quick Fix** | Create `.easignore` with `!frontend/app/assets/**` |
| **Time to Fix** | ~5 minutes |
| **Risk** | Low - only affects which files are included in builds |
