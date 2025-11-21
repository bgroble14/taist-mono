import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#fa4616',
	},
	pageView: {
		width: '100%',
		padding: 10,
		paddingTop:20,
		alignItems: 'center',
		gap:20,
	},
	text: {
		flex: 1,
		fontSize: 16,
		fontWeight: '500',
		color: '#ffffff',
		width: '100%'
	},
	vcenter: {
		flex: 1,
		justifyContent: 'center',
        marginTop: 20,
        width: '100%',
	},
});