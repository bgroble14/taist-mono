import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MenuItemStepContainer } from '../components/MenuItemStepContainer';
import { AppColors, Spacing } from '../../../../../constants/theme';
import { IMenu } from '../../../../types/index';
import { ShowErrorToast } from '../../../../utils/toast';
import StyledTextInput from '../../../../components/styledTextInput';
import StyledButton from '../../../../components/styledButton';

interface StepMenuItemDescriptionProps {
  menuItemData: Partial<IMenu>;
  onUpdateMenuItemData: (data: Partial<IMenu>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StepMenuItemDescription: React.FC<StepMenuItemDescriptionProps> = ({
  menuItemData,
  onUpdateMenuItemData,
  onNext,
  onBack,
}) => {
  const validateAndProceed = () => {
    // Validate description
    if (!menuItemData.description || menuItemData.description.trim().length === 0) {
      ShowErrorToast('Please enter a description');
      return;
    }
    
    if (menuItemData.description.trim().length < 20) {
      ShowErrorToast('Description must be at least 20 characters to give customers a good understanding');
      return;
    }

    onNext();
  };

  return (
    <MenuItemStepContainer
      title="Describe your dish"
      subtitle="Give customers a short summary of what makes this item special."
      currentStep={2}
      totalSteps={8}
    >
      <StyledTextInput
        label="Description"
        placeholder="e.g., A hearty Italian classic with layers of pasta, rich meat sauce, and creamy ricotta cheese, baked to perfection."
        value={menuItemData.description ?? ''}
        onChangeText={(val) => onUpdateMenuItemData({ description: val })}
        multiline
        numberOfLines={5}
        maxLength={500}
        style={styles.textArea}
      />

      <Text style={styles.charCount}>
        {(menuItemData.description ?? '').length}/500 characters
      </Text>

      {/* AI Integration Point - Hidden for now */}
      {/* <View style={styles.aiSection}>
        <Text style={styles.aiLabel}>✨ AI Writing Assistant (Coming Soon)</Text>
        <View style={styles.aiButtonRow}>
          <StyledButton
            title="Enhance Description"
            onPress={() => {}}
            disabled={true}
            style={[styles.aiButton, styles.aiButtonHalf]}
          />
          <StyledButton
            title="Check Grammar"
            onPress={() => {}}
            disabled={true}
            style={[styles.aiButton, styles.aiButtonHalf]}
          />
        </View>
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'right',
    marginTop: -Spacing.sm,
  },
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
  aiButtonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  aiButton: {
    opacity: 0.5,
  },
  aiButtonHalf: {
    flex: 1,
  },
});

