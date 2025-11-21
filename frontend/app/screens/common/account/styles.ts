import {Dimensions, StyleSheet} from 'react-native';
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';

const {width, height} = Dimensions.get('window');

export const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  pageView: {
    width: '100%',
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  formFields: {
    width: '100%',
    marginTop: 15,
    color: AppColors.text,
  },
  formFieldsContainer: {
    backgroundColor: 'transparent',
  },
  formInputFields: {
    color: AppColors.text,
    fontSize: 16,
  },
  addressTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  addressText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    width: '100%',
  },
  switchWrapper: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  switchText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
  },
  dropdownBox: {
    width: '100%',
    borderRadius: 4,
    marginTop: 15,
    borderColor: AppColors.border,
    color: AppColors.text,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  dropdownInput: {
    color: AppColors.text,
    fontSize: 16,
    paddingLeft: 5,
  },
  dropdown: {
    borderColor: AppColors.border,
    borderRadius: 4,
  },
  dropdownText: {
    color: AppColors.text,
    borderColor: AppColors.border,
  },
  vcenter: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
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
  },
  buttonDisabled: {
    borderRadius: 20,
    backgroundColor: '#cccccc',
    width: '100%',
    padding: 12,
    marginBottom: 5,
  },
  modalBG: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.75,
    backgroundColor: AppColors.background,
    borderRadius: 12,
    padding: 12,
    paddingVertical: 20,
    gap: 20,
  },
  modalText: {
    color: AppColors.text,
    fontSize: 16,
    textAlign: 'center',
  },
});
