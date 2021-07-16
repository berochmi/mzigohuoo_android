import React from 'react';
import { View,Text } from 'react-native';
export default function MyHeader({title}) {
    return (

        <View>
            <Text style={{ color: '#fff', fontSize: 20, paddingTop: 20, fontWeight:'bold' }}>{title}</Text>
        </View>
        
    );
}