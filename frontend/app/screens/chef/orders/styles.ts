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
		alignItems: 'center',
		width:'100%',
	},
	pageEmptyView:{
		padding: 10,
		alignItems: 'center',
		justifyContent:'center',
		gap:30,
		width:'100%',
		height:'100%',
	},
	title:{
		fontSize:20,
		fontWeight:'600',
		textAlign:'center',
		color:'#ffffff'
	},
	text:{
		fontSize:16,
		textAlign:'center',
		color:'#ffffff'
	},
	emptyImg:{
		width:'80%',
		height:'30%',
		resizeMode:'contain',
	},
	tabContainer:{
		width:'100%',
		flexDirection:'row',
		flexWrap:'wrap',
		justifyContent:'space-around',
		gap:5,
		marginTop:20,
	},
	tab:{
		backgroundColor:'#ffffff',
		borderRadius:20,
		paddingVertical:6,
		paddingHorizontal:8
	},
	tab_disabled:{
		backgroundColor:'#000000',
		borderRadius:20,
		paddingVertical:6,
		paddingHorizontal:8
	},
	tabText:{
		fontSize:10,
		color:'#fa4616'
	},
	tabText_disabled:{
		fontSize:10,
		color:'#ffffff'
	},
	orderCardContainer: {
		marginTop: 20,
		width: '100%',
	},
	orderCard: {
		width:'100%',
		backgroundColor: '#ffffff',
		borderRadius: 10,
		padding: 10,
		marginBottom: 10
	},
	orderCardMain: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 25,
	},
	orderCardImg: {
		width: 90,
		height: 80,
	},
	orderCardInfo: {
		rowGap:5,
	},
	orderCardTitle: {
		color:'#000000',
		fontWeight: '700',
		fontSize: 16
	},
	orderCardDescription: {
		color:'#000000',
		fontSize: 14
	},
});