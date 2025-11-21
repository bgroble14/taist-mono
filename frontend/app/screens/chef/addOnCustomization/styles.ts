import { StyleSheet } from "react-native";
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: AppColors.background,
	},
	pageView: {
		width: '100%',
		padding: 10,
		paddingTop:30,
		alignItems: 'center',
		gap: 20,
	},
    formFields: {
        width:'100%',
        color: AppColors.text,
	},
    formFieldsContainer: {
        backgroundColor: 'transparent',
	},
    formInputFields: {
		color: AppColors.text,
        fontSize: 14,
	},
	submitContainer:{
		width:'100%',
		paddingVertical:50,
	}
});