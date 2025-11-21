import { StyleSheet } from 'react-native';

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
  userContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fa4616',
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  itemContainer: {
    width: '100%',
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  tabContainer: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 10,
  },
  tab: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  tab_disabled: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 12,
  },
  tabText_disabled: {
    fontSize: 12,
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
