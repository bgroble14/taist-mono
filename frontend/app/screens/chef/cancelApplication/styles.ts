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
		paddingBottom:50,
		alignItems: 'center',
		gap:30,
	},
	switchWrapper: {
		width:'100%',
        marginTop: 15,
		gap:10,
    },
    agreeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff'
    },
    
	vcenter: {
        width: '100%',
		gap:10,
		paddingTop:20,
	},
});