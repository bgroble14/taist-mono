import { StyleSheet } from "react-native";
import { AppColors, Spacing, Shadows } from "../../../../constants/theme";

export const styles = StyleSheet.create({
	container: {
        flex: 1,
		paddingHorizontal: 24,
		paddingTop: 40,
		paddingBottom: 20,
        backgroundColor: AppColors.background,
	},
	logoContainer: {
		alignItems: 'center',
		marginTop: 40,
		marginBottom: 40,
	},
	logo: {
		width: 140,
		height: 70,
		resizeMode: 'contain',
	},
	welcomeText: {
		fontSize: 28,
		fontWeight: '700',
		color: AppColors.text,
		marginBottom: 8,
	},
	subtitleText: {
		fontSize: 16,
		fontWeight: '400',
		color: AppColors.textSecondary,
		marginBottom: 32,
	},
	formContainer: {
		marginBottom: 24,
	},
	inputLabel: {
		fontSize: 14,
		fontWeight: '600',
		color: AppColors.text,
		marginBottom: 8,
		marginLeft: 4,
	},
	inputWrapper: {
		marginBottom: 20,
	},
	textInput: {
		backgroundColor: AppColors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: AppColors.border,
		fontSize: 16,
		color: AppColors.text,
	},
	textInputFocused: {
		borderColor: AppColors.primary,
		borderWidth: 2,
	},
	forgotContainer: {
		alignItems: 'flex-end',
		marginBottom: 32,
	},
	forgotButton: {
		padding: 4,
	},
    forgotText: {
        fontSize: 14,
		fontWeight: '600',
        color: AppColors.primary,
    },
	loginButton: {
		borderRadius: 12,
		backgroundColor: AppColors.primary,
		paddingVertical: 16,
		marginBottom: 16,
		...Shadows.md,
	},
	loginButtonText: {
		color: AppColors.textOnPrimary,
		fontSize: 16,
		fontWeight: '700',
		textAlign: 'center',
		letterSpacing: 0.5,
	},
	dividerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 24,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: AppColors.border,
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 14,
		color: AppColors.textSecondary,
		fontWeight: '500',
	},
	signupContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 8,
	},
	signupText: {
		fontSize: 15,
		color: AppColors.textSecondary,
		marginRight: 6,
	},
	signupButton: {
		padding: 4,
	},
	signupButtonText: {
		fontSize: 15,
		fontWeight: '700',
		color: AppColors.primary,
	},

	// Material input overrides
    formFields: {
		marginBottom: 0,
	},
    formInputFields: {
		color: AppColors.text,
        fontSize: 16,
        letterSpacing: 0.3,
		paddingVertical: 12,
	},

	// Legacy styles for compatibility
	center: {
		alignItems: 'center',
		justifyContent: 'center',
	},
    vcenter: {
		justifyContent: 'center',
	},
	heading: {
		fontSize: 28,
		fontWeight: '700',
		color: AppColors.text,
		marginBottom: 8,
	},
	button: {
		borderRadius: 12,
		backgroundColor: AppColors.primary,
		width: '100%',
		paddingVertical: 16,
		marginBottom: 12,
		...Shadows.md,
	},
	buttonText: {
		color: AppColors.textOnPrimary,
		fontSize: 16,
		fontWeight: '700',
		textAlign: 'center',
		letterSpacing: 0.5,
	},
	button2: {
		width: '100%',
		padding: 8,
	},
	buttonText2: {
		color: AppColors.primary,
		fontSize: 15,
		fontWeight: '600',
		textAlign: 'center',
	},
    forgot: {
		padding: 0,
        alignSelf: 'flex-end',
		marginTop: 8,
		marginBottom: 24,
	},
});
