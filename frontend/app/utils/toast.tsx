import { StyleSheet } from 'react-native';
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
  SuccessToast,
  ToastConfig,
} from 'react-native-toast-message';

export function ShowSuccessToast(text?: string, title?: string) {
  Toast.show({
    type: 'success',
    text1: title,
    text2: text,
    position: 'bottom',
    visibilityTime: 5000,
  });
}

export function ShowErrorToast(text?: string, title?: string, onPress?: () => void) {
  Toast.show({
    type: 'error',
    text1: title,
    text2: text,
    position: 'bottom',
    visibilityTime: 5000,
    onPress: onPress
  });
}

export function ShowInfoToast(text?: string, title?: string) {
  Toast.show({
    type: 'info',
    text1: title,
    text2: text,
    position: 'bottom',
    visibilityTime: 5000,
  });
}

export const toastConfig: ToastConfig = {
  success: props => (
    <SuccessToast
      {...props}
      style={[styles.container, { borderLeftColor: '#69C779' }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.title}
      text2Style={styles.text}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
  error: props => (
    <ErrorToast
      {...props}
      style={[styles.container, { borderLeftColor: '#FE6301' }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.title}
      text2Style={styles.text}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
  info: props => (
    <InfoToast
      {...props}
      style={[styles.container, { borderLeftColor: '#87CEFA' }]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.title}
      text2Style={styles.text}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
  custom: props => (
    <BaseToast
      {...props}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.title}
      text2Style={styles.text}
      text1NumberOfLines={0}
      text2NumberOfLines={0}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    height: undefined,
  },
  contentContainer: { paddingVertical: 10 },
  title: {
    fontSize: 16,
    marginBottom: 5,
    flexWrap: 'wrap',
    color: '#000',
  },
  text: {
    fontSize: 14,
    flexWrap: 'wrap',
    color: '#000',
  },
});
