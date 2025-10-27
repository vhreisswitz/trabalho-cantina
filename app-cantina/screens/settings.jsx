import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Settings(){
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Settings Screen</Text>
        
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    btn: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007AFF',
        borderRadius: 5,
    },
});