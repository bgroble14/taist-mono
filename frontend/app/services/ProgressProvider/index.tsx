import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { InitializeNotification } from '../../firebase';
import { useAppSelector } from '../../hooks/useRedux';
import Indicator from './indicator';

type Props = {children: React.ReactNode};
const ProgressProvider = ({children}: Props) => {
  const isLoading = useAppSelector(state => state.loading.value);
  
  return (
    <View style={styles.container}>
      {children}
      {isLoading && <Indicator />}
      <InitializeNotification />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default memo(ProgressProvider);
