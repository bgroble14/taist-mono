import { StyleSheet } from 'react-native';

  const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    shadowColor: '#000000',
    shadowOffset: {width: 2.5, height: 2.5},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    padding: 12,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    color: '#fa4616',
    fontSize: 18,
    letterSpacing: 0.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  btnDisabled: {
    borderRadius: 20,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: {width: 2.5, height: 2.5},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    padding: 12,
    marginBottom: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabledTxt: {
    color: '#ffffff',
    fontSize: 18,
    letterSpacing: 0.5,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default styles;
