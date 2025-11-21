import { Dimensions, StyleSheet } from "react-native";
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';

const screen_width = Dimensions.get('window').width;
const screen_height = Dimensions.get('window').height;

export const styles = StyleSheet.create({
	// Loading splash (orange branding screen)
	splash: {
		backgroundColor: AppColors.primary,
		width: screen_width,
		height: screen_height,
		paddingHorizontal: 48,
		alignItems: 'center',
		justifyContent: 'center',
	},
	splashLogo: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
	},
	outdatedText: {
		color: AppColors.textOnPrimary,
		fontSize: 16,
		textAlign: 'center',
		marginTop: 20,
		fontWeight: '600',
	},

	// Main splash screen (white with buttons)
	main: {
		flex: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: AppColors.background,
		paddingTop: 80,
		paddingBottom: 40,
	},
	logo: {
		width: 180,
		height: 90,
		resizeMode: 'contain',
	},
	buttonsWrapper: {
		width: '100%',
		paddingHorizontal: Spacing.xl,
		gap: Spacing.md,
	},
	button: {
		borderRadius: 12,
		backgroundColor: AppColors.primary,
		paddingVertical: 16,
		alignItems: 'center',
		...Shadows.md,
	},
	buttonText: {
		color: AppColors.textOnPrimary,
		fontSize: 16,
		fontWeight: '700',
		letterSpacing: 0.5,
	}
});
