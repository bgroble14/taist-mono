import { StyleSheet } from "react-native";
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#ff3100',
	},
    container: {
		padding: 20,
		gap:30,
	},
	subContainer:{
		gap:10
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
	},
	subheading: {
		color: AppColors.text,
		fontSize: 18,
		fontWeight: '700',
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