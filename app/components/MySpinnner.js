import React from 'react';
import {View, ActivityIndicator, Text } from 'react-native';
import { Overlay} from 'react-native-elements';


export default function MySpinner() {
    return (
      <View>
        <Overlay>
            <ActivityIndicator size="large" color="#00ff00" />
            <Text>Loading...</Text>
        </Overlay>
                    
    </View>
    );
}
