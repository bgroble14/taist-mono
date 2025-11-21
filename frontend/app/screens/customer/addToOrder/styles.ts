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
  menuInfo: {
    paddingVertical: 10,
    width: '100%',
  },
  menuInfoHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  menuInfoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
  },
  menuInfoPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  menuInfoSize: {
    fontSize: 12,
    color: AppColors.text,
  },
  menuInfoDescription: {
    marginTop: 10,
    color: AppColors.text,
  },
  orderQuantity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: AppColors.surface,
    borderRadius: 10,
    padding: 10,
    width: '100%',
  },
  orderQuantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
  },
  orderQuantityAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  orderQuantityButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 4,
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderQuantityButtonText: {
    color: AppColors.textOnPrimary,
    fontSize: 20,
  },
  orderQuantityValue: {
    width: 30,
    textAlign: 'center',
    color: AppColors.text,
  },
  orderAddonsWrapper: {
    paddingVertical: 10,
    width: '100%',
  },
  orderAddonsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
  },
  orderAddonContainer: {
    alignItems: 'center',
    gap: 5,
    marginVertical: 10,
  },
  orderAddonCheckbox: {
    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
  },
  orderAddonText: {
    color: AppColors.text,
  },
  formFields: {
    marginTop: 15,
    color: AppColors.text,
  },
  formFieldsContainer: {
    backgroundColor: 'transparent',
  },
  formInputFields: {
    color: AppColors.text,
    fontSize: 14,
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
});
