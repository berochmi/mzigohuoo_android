import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import React,{useState,useEffect} from 'react';
import { StyleSheet, Text, View,ScrollView,TouchableOpacity} from 'react-native';
import { Button, Input, Header, Image, withTheme, ListItem, Icon,LinearProgress,Overlay,Divider} from 'react-native-elements';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import MySpinner from '../../components/MySpinnner';
import QMDashboard from '../../components/QMDashboard';
import * as Tools from '../../core/Tools';

export default function Dashboard({ navigation, route }) {


    useEffect(() => {
        (async() => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                showAlert("Location Permission", "Please Enable Location Permissions");
                return;
            }
        })();
    }, []);

    useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
    }, []);

    return (
        <SafeAreaProvider style={{backgroundColor:'#fff'}}>
            <ScrollView>
                
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.myTile]}
                    onPress={()=>{navigation.navigate('ReceivePackageStack',{screen:'ScanPackage'})}}
                >   
                    <Icon name='qrcode'
                  type='font-awesome'
                  size={30}
                  color='#FF9900'
                  />
                <Text style={{color:"#FF9900",fontSize:20}}>Scan Package</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={[styles.myTile]}
                    onPress={()=>{navigation.navigate('ReceivePackageStack',{screen:'AllPackages'})}}
                >   
                    <Icon name='package'
                  type='octicon'
                  size={30}
                  color='#FF9900'
                  />
                <Text style={{color:"#FF9900",fontSize:20}}>All Packages</Text>
              </TouchableOpacity> 

                </View>
            
        </ScrollView>
        <QMDashboard/>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    myTile: {
        flex: 1, height: 100, margin: 5, justifyContent: 'center', alignItems: 'center',
        borderWidth:1,borderColor:'#FF9900'
    },
    bGcolorMain: { backgroundColor: '#FF9900' },
    colorMain:{color:'#FF9900'}
}
);