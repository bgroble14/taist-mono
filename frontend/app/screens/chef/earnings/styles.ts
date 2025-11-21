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
		padding: 10,
		gap: 15,
		width: '100%'
	},
	subContainer:{
		flexDirection:'row',
		justifyContent:'space-around',
	},
	itemContainer:{
		gap:5,
		alignItems:'center',
		justifyContent:'center',
	},
	title:{
		color: AppColors.text,
		fontSize:18,
		fontWeight:'500'
	},
	text:{
		color: AppColors.text,
		fontSize:16,
		fontWeight:'400'
	},
});