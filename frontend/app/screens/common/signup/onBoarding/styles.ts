import {Dimensions, StyleSheet} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const viewHeight = Dimensions.get('window').height - 130;
export const styles = StyleSheet.create({
  main: {
    width: screenWidth,
    height: viewHeight,
    alignItems: 'center',
  },
  scrollView: {
    width: screenWidth,
  },
  pageView: {
    width: screenWidth,
    alignItems: 'center',
  },
  pageImg: {
    width: screenWidth,
    height: screenWidth * 0.87,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#ffffff',
  },
  pageDesc: {
    textAlign: 'center',
    color: '#ffffff',
  },
  subPageView: {
    width: '100%',
    padding: 10,
    rowGap: 10,
  },
  controllerContainer: {
    width: screenWidth,
    paddingBottom: 30,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
  },
  paginationIndicator: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  button: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    width: 200,
    padding: 10,
    alignSelf: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: '#fa4616',
    fontSize: 18,
    textAlign: 'center',
  },
});
