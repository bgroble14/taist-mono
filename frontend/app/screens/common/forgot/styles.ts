import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	container: {
        flex: 1,
		padding: 20,
        backgroundColor: '#fa4616',
	},
	center: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 40
	},
    vcenter: {
		flex: 1,
		justifyContent: 'center',
        marginTop: 40
	},
	logo: {
		width: 120,
		height: 60,
		margin: 20
	},
	heading: {
		fontSize: 24,
		fontWeight: '700',
		textAlign: 'center',
		color: '#ffffff'
	},
	button: {
		borderRadius: 20,
		backgroundColor: '#feffff',
		width: '100%',
		padding: 10,
		marginBottom: 5,
	},
	buttonText: {
		color: '#fa4616',
		fontSize: 18,
		textAlign: 'center'
	},
	button2: {
		width: '100%',
		padding: 10,
	},
	buttonText2: {
		color: '#ffffff',
		fontSize: 16,
		textAlign: 'center'
	},
    formFields: {
		marginTop: 20,
	},
    formInputFields: {
		color: '#ffffff',
        fontSize: 18,
	},
    forgot: {
		padding: 0,
        alignSelf: 'flex-end',
	},
    forgotText: {
        fontSize: 14, 
        color: '#ffffff',
        letterSpacing: 0.1
    },
});
