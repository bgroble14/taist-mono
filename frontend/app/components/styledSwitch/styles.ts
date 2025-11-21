import {Dimensions, StyleSheet, Platform} from "react-native";
import { AppColors } from '../../../constants/theme';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    bg:{
        backgroundColor: AppColors.primary, // Changed from white to orange (active state)
        width:60,
        height:30,
        borderRadius:30,
        alignItems:'flex-end',
        justifyContent:'center',
        padding:1,
    },
    bg_disabled:{
        backgroundColor: AppColors.border, // Changed from black to light gray (inactive state)
        width:60,
        height:30,
        borderRadius:30,
        alignItems:'flex-start',
        justifyContent:'center',
        padding:1,
    },
    thumb:{
        backgroundColor: AppColors.white, // White thumb on orange background
        width:28,
        height:28,
        borderRadius:28,
    },
    thumb_disabled:{
        backgroundColor: AppColors.white, // White thumb on gray background
        width:28,
        height:28,
        borderRadius:28,
    },
    label:{
        fontSize: 16,
        fontWeight: '500',
        color: AppColors.text // Changed from white to dark text
    }
})

export default styles;
