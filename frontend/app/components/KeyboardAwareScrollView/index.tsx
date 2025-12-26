import React, { ReactNode, forwardRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
  enableOnAndroid?: boolean;
}

/**
 * A ScrollView component that automatically adjusts its position when the keyboard appears.
 * This prevents form inputs from being covered by the keyboard on both iOS and Android.
 * 
 * Features:
 * - Automatically calculates safe area insets
 * - Works on both iOS and Android
 * - Properly handles keyboard appearance/disappearance
 * - Maintains scroll functionality
 * - Supports ref forwarding for programmatic scrolling
 */
const KeyboardAwareScrollView = forwardRef<ScrollView, KeyboardAwareScrollViewProps>(({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset,
  enableOnAndroid = true,
  ...scrollViewProps
}, ref) => {
  const insets = useSafeAreaInsets();

  // Calculate keyboard offset based on platform and safe area
  const getKeyboardVerticalOffset = () => {
    if (keyboardVerticalOffset !== undefined) {
      return keyboardVerticalOffset;
    }
    
    // For iOS, use padding behavior with safe area top inset
    // For Android, use height behavior with status bar height
    if (Platform.OS === 'ios') {
      return 0; // padding behavior doesn't need offset
    } else {
      // Android: account for status bar height
      return insets.top;
    }
  };

  // Determine behavior based on platform
  const behavior = Platform.OS === 'ios' ? 'padding' : 'height';

  // On Android, KeyboardAvoidingView can sometimes cause issues
  // So we conditionally enable it
  if (Platform.OS === 'android' && !enableOnAndroid) {
    return (
      <ScrollView
        ref={ref}
        style={style}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={behavior}
      keyboardVerticalOffset={getKeyboardVerticalOffset()}
      enabled={Platform.OS === 'ios' || enableOnAndroid}
    >
      <ScrollView
        ref={ref}
        contentContainerStyle={[
          { flexGrow: 1, paddingBottom: 20 },
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

KeyboardAwareScrollView.displayName = 'KeyboardAwareScrollView';

export default KeyboardAwareScrollView;
