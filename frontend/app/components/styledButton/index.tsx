import React, {memo} from 'react';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import styles from './styles';
 
interface Props extends TouchableOpacityProps {
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  title?: any;
  titleStyle?: StyleProp<TextStyle>;
}

const StyledButton: React.FC<Props> = ({
  disabled = false,
  style,
  title,
  titleStyle,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[disabled ? styles.btnDisabled : styles.btn, style]}
      disabled={disabled}
      {...props}>
      <Text
        style={[disabled ? styles.btnDisabledTxt : styles.btnTxt, titleStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(StyledButton);
