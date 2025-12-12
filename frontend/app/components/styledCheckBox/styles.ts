import {Dimensions, StyleSheet, Platform} from "react-native";
import { AppColors } from '../../../constants/theme';

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection:'row',
        alignItems:'center',
        gap:10,
    },
    box:{
        width:22,
        height:22,
        borderWidth:2,
        borderRadius:5,
        borderColor: AppColors.text,
        alignItems:'center',
        justifyContent:'center'
    },
    boxChecked:{
        backgroundColor: AppColors.primary,
        borderColor: AppColors.primary,
    },
    label:{
        color: AppColors.text,
        flex: 1,
    }
})

export default styles;
