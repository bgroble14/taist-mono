import {StyleSheet, Dimensions} from 'react-native';
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


const screenWidth = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: AppColors.background,
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
    color: AppColors.text,
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
    color: AppColors.text,
  },
  chefCardInsured: {
    fontWeight: '700',
    color: AppColors.text,
  },
  chefCardReviewHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
  },
  chefCardAllergenHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginTop: 10,
  },
  chefCard: {
    backgroundColor: AppColors.surface,
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
    color: AppColors.text,
  },
  chefCardMenuItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  chefCardMenuItemDescription: {
    marginVertical: 5,
    color: AppColors.text,
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
    color: AppColors.text,
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
    color: AppColors.textOnPrimary,
    fontSize: 16,
    textAlign: 'center',
  },
});
