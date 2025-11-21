import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {memo} from 'react';

const Indicator = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} color={'#fff'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000080',
  },
});

export default memo(Indicator);
