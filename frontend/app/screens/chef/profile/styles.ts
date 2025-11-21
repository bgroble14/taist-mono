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
		gap: 30,
		width: '100%'
	},
	formFields: {
		width: '100%',
		marginTop: 15,
        color: AppColors.text,
	},
    formFieldsContainer: {
        backgroundColor: 'transparent',
	},
    formInputFields: {
		color: AppColors.text,
        fontSize: 16,
	},
	title:{
		color: AppColors.text,
		fontSize:18,
		fontWeight:'600'
	},
	text:{
		color: AppColors.text,
		fontSize:16,
		fontWeight:'500'
	},
	row:{
		flexDirection:'row',
		width:'100%',
		gap:5
	},
	col_days:{
		alignItems:'flex-start',
		justifyContent:'center',
		height:30,
		flex:1
	},
	col_start:{
		alignItems:'center',
		justifyContent:'center',
		height:30,
		flex:1
	},
	col_end:{
		alignItems:'center',
		justifyContent:'center',
		height:30,
		flex:1
	},
	timeBox:{
		width:'100%',
		height:'100%',
		borderWidth:1,
		borderRadius:5,
		borderColor:AppColors.border,
		justifyContent:'center',
		alignItems:'center',
	}
});