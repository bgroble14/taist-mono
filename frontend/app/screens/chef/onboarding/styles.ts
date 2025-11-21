import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#fa4616',
	},
	pageView: {
		width:screenWidth,
		height:'100%',
		alignItems:'center',
	},
	pageImg:{
		width:screenWidth,
		height:300,
		marginBottom:50,
	},
    pageTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#ffffff'
	},
	pageText:{
		color: '#ffffff'
	},
    subPageView:{
		width:'100%',
		padding:15,
		rowGap:10
	},
	paginationContainer:{
		position:'absolute',
		left:0,
		right:0,
		bottom:150,
		flexDirection:'row',
		justifyContent:'center',
		gap:10,
	},
	paginationIndicator:{
		width:10,
		height:10,
		backgroundColor:'rgba(0,0,0,0.5)',
		borderRadius:10,
	},
	button: {
		borderRadius: 20,
		backgroundColor: '#feffff',
		width: 200,
		padding: 10,
		alignSelf:'center',
		marginBottom: 5,
	},
	buttonText: {
		color: '#fa4616',
		fontSize: 18,
		textAlign: 'center'
	},
});