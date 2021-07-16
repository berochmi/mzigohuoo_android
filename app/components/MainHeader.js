import React from 'react';
import { View,Text } from 'react-native';
export default function MainHeader({title}) {
    return (
        <View>
            <Text style={{ color: '#fff', fontSize: 30, paddingTop: 10,textAlign:'center'}}>{title}</Text>
        </View>
        
    );
}