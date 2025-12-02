import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppColors } from '../../../../../constants/theme';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < currentStep ? styles.completed : styles.incomplete,
            index === currentStep - 1 ? styles.active : null,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  incomplete: {
    backgroundColor: AppColors.textSecondary + '40', // 40 = 25% opacity
  },
  active: {
    backgroundColor: AppColors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  completed: {
    backgroundColor: AppColors.primary,
  },
});


