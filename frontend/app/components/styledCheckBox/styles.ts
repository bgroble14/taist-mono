import {Dimensions, StyleSheet, Platform} from "react-native";

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
        borderColor:'white',
        alignItems:'center',
        justifyContent:'center'
    },
    label:{
        color:'white'
    }
})

export default styles;
