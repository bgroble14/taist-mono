import { StyleSheet } from "react-native";
import { AppColors } from '../../../constants/theme';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth:1.5,
        borderColor: AppColors.border, // Changed from white to light gray
        borderRadius:5,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        backgroundColor: AppColors.background, // Added white background
    },
    textInput:{
        width:'100%',
        fontSize: 16,
        fontWeight: '500',
        color: AppColors.text, // Changed from white to dark text
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:15,
        paddingRight:15,
    },
    thumb:{
        backgroundColor: AppColors.primary, // Changed from red to orange
        width:28,
        height:28,
        borderRadius:28,
    },
    thumb_disabled:{
        backgroundColor: AppColors.border, // Changed from white to light gray
        width:28,
        height:28,
        borderRadius:28,
    },
    labelContainer:{
        position:'absolute',
        top:-10,
        left:20,
        paddingHorizontal:10,
        backgroundColor: AppColors.background // Changed from orange to white
    },
    label:{
        fontSize: 16,
        fontWeight: '400',
        color: AppColors.text // Changed from white to dark text
    }
})
export default styles;