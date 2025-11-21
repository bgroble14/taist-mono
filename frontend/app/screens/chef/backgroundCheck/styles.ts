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
	addressTextWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	addressText: {
		flex: 1,
		fontSize: 18,
		fontWeight: '700',
		color: '#ffffff',
		width: '100%'
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
    dropdownBox: {
		width: '100%',
        borderRadius: 4,
        marginTop: 15,
        borderColor: '#ffffff',
        color: '#ffffff',
        paddingHorizontal: 10,
        paddingVertical: 16,
    },
    dropdownInput: {
        color: '#ffffff',
        fontSize: 16,
        paddingLeft: 5
    },
    dropdown: {
        borderColor: '#ffffff',
        borderRadius: 4,
    },
    dropdownText: {
        color: '#ffffff',
        borderColor: '#ffffff',
    },
	vcenter: {
        width: '100%',
		gap:10,
		paddingTop:20,
	},
});