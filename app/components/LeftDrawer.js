import React from 'react';
import { View } from 'react-native';
import { Icon,Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
export default function LeftDrawer() {
    const navigation = useNavigation();

    return (
        <View style={{marginLeft:5,paddingTop:20}}>
              <Button
        icon={{
            name: "menu",
            size: 24,
            color: "white",
            type:'material'
            }}
            type="clear"

            onPress={()=>{navigation.openDrawer()}} 
        /> 

        </View>
      
    );
}