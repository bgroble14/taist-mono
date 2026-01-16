# Profile Image Bug Analysis

## Date: December 29, 2025

## Summary
Profile images stopped displaying on both the chef signup screen and chef cards (e.g., Anthony A.) after commit `79e53e5` on December 26, 2025.

---

## What We Observed
1. **Signup screen**: Empty space where profile photo placeholder should be
2. **Chef cards**: Anthony A. showing no profile image

---

## The Two Separate Issues

### Issue 1: Fallback Icon is White on Transparent
The fallback icon `Icon_Profile.png` is a **white silhouette on transparent background**. On a white/light screen background, it's invisible.

**This was always broken** - but was masked because the old code wrapped it in a gray overlay circle (`backgroundColor: 'grey'`), making it visible.

### Issue 2: The Optimization Broke Primary Image Loading
This is the **main bug** introduced by commit `79e53e5`.

#### OLD CODE (working):
```tsx
<Image
  style={style}
  source={{uri: props.url}}
  onLoadStart={handleLoadStart}
  onLoad={handleLoad}
  onLoadEnd={handleLoadEnd}
/>
{!isLoaded && (
  <View style={styles.overlay}>  {/* Gray circle overlay */}
    <Image source={require('...Icon_Profile.png')} />
  </View>
)}
```

- Used `source={{uri: props.url}}` - passed URL directly
- Overlay shown while loading, hidden when `onLoad` fires
- **Worked fine** - images loaded and displayed

#### NEW CODE (broken):
```tsx
const source = url ? { uri: url } : FALLBACK_IMAGE;

<Image
  style={imageStyle}
  source={source}
  placeholder={blurhash || DEFAULT_BLURHASH}
  placeholderContentFit="cover"
  cachePolicy="memory-disk"
  priority={priority}
  transition={200}
  contentFit="cover"
/>
```

- Removed the overlay mechanism entirely
- Relied on `expo-image`'s `placeholder` prop with blurhash
- **The blurhash is very light/white** - invisible on white background
- **No `onLoad`/`onError` handling** - no way to show fallback on failure

---

## Root Cause Analysis

The optimization made these problematic changes:

1. **Removed the visible gray overlay** - replaced with an invisible blurhash
2. **Removed load state tracking** - no `useState` for `isLoaded`
3. **No error handling** - if remote image 404s, shows nothing (just the invisible blurhash)
4. **Assumed blurhash would be visible** - but `L6PZfSi_.AyE_3t7t7R**0o#DgR4` is nearly white

---

## Why Images "Stopped Working"

The images themselves likely still work. The problem is:

1. **While loading**: Shows invisible blurhash instead of gray circle
2. **On error (404)**: Shows invisible blurhash forever (no error fallback)
3. **No URL**: Shows invisible blurhash (fallback logic existed but blurhash covers it)

So it *looks* like images aren't loading, but really the placeholder is just invisible.

---

## The Fix

Keep the optimizations but restore visibility:

1. **Keep** `cachePolicy="memory-disk"` - good for performance
2. **Keep** `useMemo` for styles - prevents re-renders
3. **Keep** `transition={200}` - smooth fade-in
4. **Restore** the gray overlay placeholder while loading
5. **Add** `onError` handling to show fallback on 404s

---

## Commits
- `79e53e5` (Dec 26) - Introduced the bug
- `26b6a9a` (Dec 29) - Reverted to fix immediate issue
- Next commit - Should re-add optimizations with proper fallback handling
