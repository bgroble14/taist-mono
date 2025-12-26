# React Native Performance Guide

Reusable performance patterns for the Taist mobile app.

## Component Memoization

### React.memo with Custom Comparison

Use `React.memo` with a custom comparison function to prevent unnecessary re-renders:

```tsx
import { memo } from 'react';

type Props = {
  item: IItem;
  onPress: (id: number) => void;
};

const MyComponent = ({ item, onPress }: Props) => {
  // component code
};

// Compare by stable IDs and callback reference
const arePropsEqual = (prev: Props, next: Props): boolean => {
  return (
    prev.item.id === next.item.id &&
    prev.onPress === next.onPress
  );
};

export default memo(MyComponent, arePropsEqual);
```

**When to use:** List items, cards, and components rendered in loops.

### useMemo for Computed Values

```tsx
// Calculate average rating only when reviews change
const averageRating = useMemo(() => {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  return total / reviews.length;
}, [reviews]);
```

### useCallback for Stable Handlers

```tsx
// Stable callback reference - only changes when dependencies change
const handlePress = useCallback(() => {
  onNavigate(item.id);
}, [onNavigate, item.id]);
```

## Image Optimization

### expo-image with Caching

```tsx
import { Image } from 'expo-image';

const DEFAULT_BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

<Image
  source={{ uri: imageUrl }}
  placeholder={DEFAULT_BLURHASH}
  placeholderContentFit="cover"
  cachePolicy="memory-disk"
  priority="normal"  // 'low' | 'normal' | 'high'
  transition={200}
  contentFit="cover"
/>
```

**Key properties:**
- `cachePolicy="memory-disk"` - Two-tier caching
- `placeholder` - Blurhash for instant placeholder
- `transition={200}` - Smooth fade-in (ms)
- `priority` - Load priority for visible vs offscreen images

## Redux Optimization

### Batch Multiple Dispatches

Instead of dispatching in a loop:

```tsx
// ❌ Bad - N dispatches trigger N re-renders
data.forEach(item => {
  dispatch(setMenu(item.menu));
});

// ✅ Good - Single dispatch
const allMenus = data.flatMap(item => item.menus);
dispatch(setMenus(allMenus));
```

### Redux Persist Configuration

```tsx
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  throttle: 1000,  // Max 1 persist per second
  blacklist: ['loading', 'tempData'],  // Don't persist volatile state
};
```

## List Performance

### Stable Keys

```tsx
// ❌ Bad - Index-based keys cause unnecessary remounts
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ Good - Stable ID-based keys
{items.map(item => (
  <Item key={`item_${item.id}`} data={item} />
))}
```

### Avoid Inline Functions in Render

```tsx
// ❌ Bad - Creates new function every render
<TouchableOpacity onPress={() => navigate(item.id)}>

// ✅ Good - Stable reference with useCallback
const handlePress = useCallback(() => navigate(item.id), [item.id]);
<TouchableOpacity onPress={handlePress}>
```

### Constant Style Objects

```tsx
// ❌ Bad - New object every render
<StarRating starStyle={{ marginHorizontal: 0 }} />

// ✅ Good - Constant reference
const STAR_STYLE = { marginHorizontal: 0 };
<StarRating starStyle={STAR_STYLE} />
```

## Loading States

### Spinner Timing with InteractionManager

Defer spinner removal until animations complete:

```tsx
import { InteractionManager } from 'react-native';

useEffect(() => {
  if (dataLoaded) {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        setShowSpinner(false);
      });
    });
  }
}, [dataLoaded]);
```

## Quick Reference

| Pattern | Use Case | Impact |
|---------|----------|--------|
| `React.memo` | List items, repeated components | Prevents re-renders |
| `useMemo` | Computed values, filtered arrays | Avoids recalculation |
| `useCallback` | Event handlers passed as props | Stable references |
| `cachePolicy="memory-disk"` | Images | Faster loads, less network |
| Redux batching | Multiple state updates | Fewer re-renders |
| Stable keys | FlatList, map() | Prevents remounting |
| Constant styles | Static style objects | Stable references |
