import { Dimensions, StyleSheet } from "react-native";

const screen_width = Dimensions.get('window').width;
const screen_height = Dimensions.get('window').height;

export const styles = StyleSheet.create({
	outdatedText: {
		color: 'white',
		fontSize: 18,
		textAlign: 'center',
		marginTop: 20,
	},
	main: {
		flex: 1, 
		justifyContent: 'space-around', 
		alignItems: 'center',
		backgroundColor: '#fa4616',
	},
	splash:{
		backgroundColor: '#fa4616',
		width:screen_width,
		height:screen_height,
		paddingHorizontal:48,
		alignItems:'center',
	},
	splashLogo:{
		width:'100%',
		height:'100%',
		resizeMode:'contain',
	},
    logo: {
		width: 160,
		height: 80
	},
	buttonsWrapper: {
		width: '100%',
		padding: 20
	},
	button: {
		borderRadius: 20,
		backgroundColor: '#feffff',
		width: '100%',
		padding: 10,
		marginBottom: 20,
	},
	buttonText: {
		color: '#fa4616',
		fontSize: 18,
		textAlign: 'center'
	}
});