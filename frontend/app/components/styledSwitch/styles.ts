import {Dimensions, StyleSheet, Platform} from "react-native";

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between'
    },
    bg:{
        backgroundColor: '#ffffff',
        width:60,
        height:30,
        borderRadius:30,
        alignItems:'flex-end',
        justifyContent:'center',
        padding:1,
    },
    bg_disabled:{
        backgroundColor: '#000000',
        width:60,
        height:30,
        borderRadius:30,
        alignItems:'flex-start',
        justifyContent:'center',
        padding:1,
    },
    thumb:{
        backgroundColor: '#ff3100',
        width:28,
        height:28,
        borderRadius:28,
    },
    thumb_disabled:{
        backgroundColor: '#ffffff',
        width:28,
        height:28,
        borderRadius:28,
    },
    label:{
        fontSize: 16,
        fontWeight: '500',
        color: 'white'
    }
})

export default styles;
