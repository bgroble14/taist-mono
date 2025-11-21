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
    gap: 40,
    width: '100%',
  },
  missingHeading: {
    fontSize: 30,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 0.5,
  },
  missingImg: {
    width: 240,
    height: 240,
  },
  missingSubheading: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  formFields: {
    marginTop: 10,
    color: '#ffffff',
    borderColor: '#ffffff',
  },
  formFieldsContainer: {
    backgroundColor: 'transparent',
    borderColor: '#ffffff',
  },
  formInputFields: {
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  calendar: {
    marginTop: 10,
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  chefCardContainer: {
    marginTop: 20,
  },
  chefCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  chefCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  chefCardMenu: {},
  chefCardMenuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  chefCardMenuItemHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  chefCardMenuItemTitle: {
    fontSize: 18,
    color: '#000000',
    letterSpacing: 0.5,
  },
  chefCardMenuItemPrice: {
    fontSize: 18,
    color: '#000000',
    letterSpacing: 0.5,
  },
  chefCardMenuItemSize: {
    fontSize: 12,
    color: '#000000',
    letterSpacing: 0.5,
  },
  chefCardMenuItemDescription: {
    marginVertical: 5,
    fontSize: 14,
    color: '#000000',
    letterSpacing: 0.5,
  },
  chefCardImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  chefCardInfo: {flex: 1, height: '100%'},
  chefCardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000000',
    letterSpacing: 0.5,
  },
  chefCardDescription: {
    fontSize: 14,
    color: '#7f7f7f',
    maxWidth: 240,
    letterSpacing: 0.5,
  },
  chefCardReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 5,
  },
});
