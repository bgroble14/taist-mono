import {StyleSheet} from 'react-native';

const GlobalStyles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fa4616',
  },
  pageView: {
    padding: 10,
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  whiteCardContainer: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 15,
    gap: 10,
    elevation: 5,
    shadowRadius: 5,
    shadowOffset: {width: 2.5, height: 2.5},
    shadowOpacity: 0.3,
    shadowColor: '#000000',
  },
  rowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  btn: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    // width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  btnTxt: {
    color: '#fa4616',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  btnDisabled: {
    borderRadius: 20,
    backgroundColor: '#000000',
    width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  btnDisabledTxt: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default GlobalStyles;
