import { StyleSheet } from 'react-native';
import { AppColors, Spacing } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Toggle button in header
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  containerLive: {
    backgroundColor: '#e8f5e9',
  },
  containerOffline: {
    backgroundColor: '#f5f5f5',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotLive: {
    backgroundColor: AppColors.success,
  },
  statusDotOffline: {
    backgroundColor: '#999999',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusTextLive: {
    color: AppColors.success,
  },
  statusTextOffline: {
    color: '#666666',
  },

  // Time picker modal (follows existing pattern from dayRowComponent)
  timePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area for home indicator
    overflow: 'hidden',
  },
  timePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  timePickerModalCancel: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  timePickerModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.text,
  },
  timePickerModalDone: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  timePickerPicker: {
    width: '100%',
    height: 216, // iOS standard picker height
    backgroundColor: 'white',
  },

  // Confirmation modal for going offline
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 320,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  confirmButtonConfirm: {
    backgroundColor: AppColors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonTextCancel: {
    color: AppColors.text,
  },
  confirmButtonTextConfirm: {
    color: 'white',
  },
});
