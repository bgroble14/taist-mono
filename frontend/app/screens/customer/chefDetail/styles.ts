import {StyleSheet, Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;

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
  chefName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  chefCardContainer: {
    marginTop: 20,
  },
  chefImg: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  chefReviewContainer: {
    width: '100%',
    gap: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chefCardReview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 5,
  },
  chefCardDescription: {
    color: '#000000',
  },
  chefCardInsured: {
    fontWeight: '700',
    color: '#000000',
  },
  chefCardReviewHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  chefCardAllergenHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 10,
  },
  chefCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    width: '100%',
  },
  chefCardMenuItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  chefCardMenuItemHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  chefCardMenuItemTitle: {
    fontSize: 18,
    fontWeight: '700',
    width: '70%',
    color: '#000000',
  },
  chefCardMenuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  chefCardMenuItemDescription: {
    marginVertical: 5,
    color: '#000000',
  },
  chefCardInnerReview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 5,
  },
  chefCardInnerReviewDate: {
    fontWeight: '700',
    color: '#000000',
  },
  allegenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  checkoutButton: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    width: screenWidth - 20,
    alignItems: 'center',
  },
  checkoutButtonLabel: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
