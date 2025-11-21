import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#ff3100',
	},
    container: {
		padding: 20,
		gap:30,
	},
	subContainer:{
		gap:10
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
	},
	subheading: {
		color: '#ffffff',
		fontSize: 18,
		fontWeight: '700',
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