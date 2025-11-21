import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth:1.5,
        borderColor:'#ffffff',
        borderRadius:5,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
    },
    textInput:{
        width:'100%',
        fontSize: 16,
        fontWeight: '500',
        color: 'white',
        paddingTop:10,
        padding:10,
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
    labelContainer:{
        position:'absolute',
        top:-10,
        left:20,
        paddingHorizontal:10,
        backgroundColor:'#fa4616'
    },
    label:{
        fontSize: 16,
        fontWeight: '400',
        color: 'white'
    }
})
export default styles;