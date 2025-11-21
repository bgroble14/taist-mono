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
		gap: 10,
		width: '100%'
	},
    heading: {
		width: '100%',
		marginTop: 10
    },
	backIcon: {
		width: 20,
		height: 20
	},
    pageTitle: {
		fontSize: 24,
		fontWeight: '700',
		color: '#ffffff'
	},
    subheading: {
		fontSize: 18,
		color: '#ffffff',
		marginVertical: 10,
        textAlign: 'center'
	},
    switchWrapper: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    switchText: {
		flex: 1,
        fontSize: 16,
        color: '#ffffff'
    },
    vcenter: {
		flex: 1,
		justifyContent: 'center',
        marginTop: 20,
        width: '100%',
	},
});