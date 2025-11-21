import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#fa4616',
	},
    container: {
		padding: 20,
	},
	button: {
		marginBottom: 10,
	},
	backIcon: {
		width: 20,
		height: 20
	},
	heading: {
		color: '#ffffff',
		fontSize: 30,
		fontWeight: '700',
		marginVertical: 10
	},
	subheading: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '700',
		marginTop: 20
	},
	textWrapper: {
		color: '#ffffff',
		marginTop: 10
	},
	textNormal: {
		color: '#ffffff',
	},
	textBold: {
		color: '#ffffff',
		fontWeight: '700'
	}
});