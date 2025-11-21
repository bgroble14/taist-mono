import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#fa4616',
	},
	pageView: {
		padding: 10,
		gap: 30,
		width: '100%'
	},
	formFields: {
		width: '100%',
		marginTop: 15,
        color: '#ffffff',
	},
    formFieldsContainer: {
        backgroundColor: 'transparent',
	},
    formInputFields: {
		color: '#ffffff',
        fontSize: 16,
	},
	title:{
		color:'#ffffff',
		fontSize:18,
		fontWeight:'600'
	},
	text:{
		color:'#ffffff',
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
		borderColor:'#ffffff',
		justifyContent:'center',
		alignItems:'center',
	}
});