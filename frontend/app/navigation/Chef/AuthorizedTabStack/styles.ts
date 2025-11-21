import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    borderTopWidth: 0,
    height: 50,
    paddingBottom: 5,
  },
  drawerWrapper: {
    flexDirection: 'column',
    backgroundColor: 'white',
    flex: 1,
    padding: 10,
  },
  drawerClose: {
    marginTop: 5,
  },
  drawerNavigationWrapper: {
    marginTop: 40,
    padding: 5,
  },
  drawerLink: {
    paddingVertical: 15,
  },
  drawerLinkText: {
    fontWeight: '700',
    color: '#000000',
  },
});
