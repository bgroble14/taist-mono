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
    gap: 20,
    width: '100%',
    flex: 1,
  },
  missingHeading: {
    fontSize: 25,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
  },
  missingImg: {
    width: '80%',
    height: 240,
    resizeMode: 'contain',
  },
  missingSubheading: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    gap: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 5,
    elevation: 5,
    shadowRadius: 5,
    shadowOffset: {width: 2.5, height: 2.5},
    shadowOpacity: 0.3,
    shadowColor: '#000000',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  cardText: {
    color: '#000000',
  },
  tabContainer: {
    flexDirection: 'row',
    columnGap: 20,
  },
  tab: {
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
});
