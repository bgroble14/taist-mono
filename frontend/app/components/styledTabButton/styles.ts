import { StyleSheet } from 'react-native';

  const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    shadowColor: '#000000',
    shadowOffset: {width: 5, height: 5},
    elevation: 5,
    padding: 12,
    paddingVertical: 6,
  },
  btnTxt: {
    color: '#fa4616',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    borderRadius: 20,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: {width: 5, height: 5},
    elevation: 5,
    padding: 12,
    paddingVertical: 6,
  },
  btnDisabledTxt: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default styles;
