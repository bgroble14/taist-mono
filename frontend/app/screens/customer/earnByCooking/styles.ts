import { StyleSheet } from "react-native";
import { AppColors, Shadows, Spacing } from '../../../../constants/theme';


export const styles = StyleSheet.create({
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: AppColors.background,
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
		color: AppColors.text
	},
    subheading: {
		fontSize: 18,
		color: AppColors.text,
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
        color: AppColors.text
    },
    vcenter: {
		flex: 1,
		justifyContent: 'center',
        marginTop: 20,
        width: '100%',
	},
});