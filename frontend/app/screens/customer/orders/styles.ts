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
    width: '100%',
  },
  tabContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 5,
    marginTop: 20,
  },
  tab: {
    // backgroundColor:'#ffffff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tab_disabled: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 10,
    // color: '#fa4616',
  },
  tabText_disabled: {
    fontSize: 10,
    color: '#ffffff',
  },
  orderCardContainer: {
    marginTop: 20,
    width: '100%',
  },
  orderCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  orderCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 25,
  },
  orderCardImg: {
    width: 90,
    height: 80,
  },
  orderCardInfo: {
    rowGap: 5,
  },
  orderCardTitle: {
    color: '#000000',
    fontWeight: '700',
  },
  orderCardDescription: {
    color: '#000000',
  },
});
