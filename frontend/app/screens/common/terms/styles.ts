import { StyleSheet } from "react-native";
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: AppColors.background,
	},
    container: {
		padding: 20,
	},
	button: {
		marginBottom: 10,
	},
	backIcon: {
		width: 20,
		height: 20
	},
	heading: {
		color: AppColors.text,
		fontSize: 30,
		fontWeight: '700',
		marginVertical: 10
	},
	subheading: {
		color: AppColors.text,
		fontSize: 18,
		fontWeight: '700',
		marginTop: 20
	},
	textWrapper: {
		color: AppColors.text,
		marginTop: 10
	},
	textNormal: {
		color: AppColors.text,
	},
	textBold: {
		color: AppColors.text,
		fontWeight: '700'
	}
});