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
		paddingTop:30,
		alignItems: 'center',
		gap: 20,
	},
    formFields: {
        width:'100%',
        color: '#ffffff',
	},
    formFieldsContainer: {
        backgroundColor: 'transparent',
	},
    formInputFields: {
		color: '#ffffff',
        fontSize: 14,
	},
	submitContainer:{
		width:'100%',
		paddingVertical:50,
	}
});