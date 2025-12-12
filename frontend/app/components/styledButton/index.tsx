import React, {memo, useRef, useCallback} from 'react';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import styles from './styles';

interface Props extends TouchableOpacityProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: any;
  titleStyle?: StyleProp<TextStyle>;
  debounceMs?: number;
}

const StyledButton: React.FC<Props> = ({
  disabled = false,
  style,
  title,
  titleStyle,
  debounceMs = 500,
  onPress,
  ...props
}) => {
  const lastPressTime = useRef(0);

  const handlePress = useCallback((event: any) => {
    const now = Date.now();
    if (now - lastPressTime.current < debounceMs) {
      return;
    }
    lastPressTime.current = now;
    onPress?.(event);
  }, [onPress, debounceMs]);

  return (
    <TouchableOpacity
      style={[disabled ? styles.btnDisabled : styles.btn, style]}
      disabled={disabled}
      onPress={handlePress}
      {...props}>
      <Text
        style={[disabled ? styles.btnDisabledTxt : styles.btnTxt, titleStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(StyledButton);
