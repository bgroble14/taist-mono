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
		color:'#000000',
		fontSize:18,
		fontWeight:'500'
	},
	text:{
		color:'#000000',
		fontSize:16,
		fontWeight:'400'
	},
});