import {Dimensions, StyleSheet, Platform} from "react-native";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fa4616',
        position: "relative",
        marginBottom: 60
    },
    topHeader: {
        width: '100%',
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        padding: 10
    },
    topHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
    },
    drawerClose: {
        marginTop: 5
    },
})
export default styles;
