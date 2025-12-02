import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MenuItemStepContainer } from '../components/MenuItemStepContainer';
import { AppColors, Spacing } from '../../../../../constants/theme';
import { IMenu } from '../../../../types/index';
import { ShowErrorToast } from '../../../../utils/toast';
import StyledTextInput from '../../../../components/styledTextInput';
import StyledButton from '../../../../components/styledButton';

interface StepMenuItemNameProps {
  menuItemData: Partial<IMenu>;
  onUpdateMenuItemData: (data: Partial<IMenu>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepMenuItemName: React.FC<StepMenuItemNameProps> = ({
  menuItemData,
  onUpdateMenuItemData,
  onNext,
  onBack,
}) => {
  const validateAndProceed = () => {
    // Validate name
    if (!menuItemData.title || menuItemData.title.trim().length === 0) {
      ShowErrorToast('Please enter a menu item name');
      return;
    }
    
    if (menuItemData.title.trim().length < 3) {
      ShowErrorToast('Menu item name must be at least 3 characters');
      return;
    }

    onNext();
  };

  return (
    <MenuItemStepContainer
      title="What's the name of your dish?"
      subtitle="This is the name that will be displayed to customers."
      currentStep={1}
      totalSteps={8}
    >
      <StyledTextInput
        label="Menu Item Name"
        placeholder="e.g., Grandma's Lasagna"
        value={menuItemData.title ?? ''}
        onChangeText={(val) => onUpdateMenuItemData({ title: val })}
        autoCapitalize="words"
        maxLength={100}
      />

      {/* AI Integration Point - Hidden for now */}
      {/* <View style={styles.aiSection}>
        <Text style={styles.aiLabel}>✨ AI Assistant (Coming Soon)</Text>
        <StyledButton
          title="Improve Name"
          onPress={() => {}}
          disabled={true}
          style={styles.aiButton}
        />
      </View> */}

      <View style={styles.buttonContainer}>
        <StyledButton
          title="Continue"
          onPress={validateAndProceed}
        />
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    </MenuItemStepContainer>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    fontSize: 16,
    color: AppColors.primary,
    fontWeight: '600',
  },
  aiSection: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 8,
  },
  aiLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: Spacing.sm,
  },
  aiButton: {
    opacity: 0.5,
  },
});

