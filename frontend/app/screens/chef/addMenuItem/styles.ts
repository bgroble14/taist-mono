import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
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
  heading: {
    width: '100%',
    marginTop: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headTitle: {
    fontWeight: '500',
    fontSize: 20,
    color: '#ffffff',
    textAlign: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  subMainContainer: {
    width: '100%',
    gap: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ffffff',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
  },
  text: {
    color: '#ffffff',
  },
  text1: {
    color: '#fa4616',
  },
  formFields: {
    width: '100%',
    color: '#ffffff',
  },
  formFieldsContainer: {
    backgroundColor: 'transparent',
  },
  formInputFields: {
    color: '#ffffff',
    fontSize: 14,
  },
  tabContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
  },
  tab: {
    borderRadius: 20,
    backgroundColor: '#feffff',
    padding: 15,
    paddingVertical: 10,
  },
  tabText: {
    color: '#fa4616',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabDisabled: {
    borderRadius: 20,
    backgroundColor: '#000000',
    padding: 15,
    paddingVertical: 10,
  },
  tabDisabledText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  applianceContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
  },
  applianceNormal: {
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },
  applianceSelected: {
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  applianceImg: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  applianceText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
  },
  applianceTextSelected: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fa4616',
    textAlign: 'center',
  },
  completionTimeContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 50,
  },
  customizationItem: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitContainer: {
    width: '100%',
    paddingVertical: 50,
  },
});
