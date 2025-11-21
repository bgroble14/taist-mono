import {StyleSheet} from 'react-native';
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


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
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
  },
  checkoutBlock: {
    width: '100%',
  },
  checkoutSubheading: {
    fontSize: 18,
    color: AppColors.text,
    marginVertical: 10,
  },
  checkoutText: {
    color: AppColors.text,
    marginLeft: 10,
  },
  calendarWrapper: {
    marginVertical: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  estimated: {
    fontSize: 12,
    fontWeight: '700',
    color: AppColors.text,
    margin: 10,
  },
  checkoutSummaryItemWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
  },
  checkoutSummaryItemTitle: {
    fontSize: 16,
    color: AppColors.text,
  },
  checkoutSummaryItemAddon: {
    fontSize: 10,
    color: AppColors.text,
  },
  checkoutSummaryItemPriceWrapper: {
    flexDirection: 'row',
    gap: 20,
  },
  checkoutAddressItemTitle: {
    fontSize: 16,
    color: AppColors.text,
    marginBottom: 10,
  },
  checkoutPaymentItemWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    padding: 10,
    borderBottomColor: '#cccccc',
    borderBottomWidth: 1,
  },
  checkoutApplianceItemTitle: {
    fontSize: 16,
    color: AppColors.text,
  },
  switchWrapper: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  switchText: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text,
  },
  vcenter: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  button: {
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  buttonText: {
    color: AppColors.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonDisabled: {
    borderRadius: 20,
    backgroundColor: '#cccccc',
    width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  cardStyle: {
    width: '100%',
    height: 100,
    borderRadius: 20,
  },
});
