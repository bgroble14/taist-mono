import {StyleSheet} from 'react-native';
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


export const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: AppColors.background, // White background
  },
  pageView: {
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  heading: {
    width: '100%',
    marginTop: Spacing.sm,
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
    gap: Spacing.md,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    width: '100%',
    ...Shadows.sm,
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
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  button: {
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    width: '100%',
    paddingVertical: 16,
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  buttonText: {
    color: AppColors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
