import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Input,
  Header,
  Image,
  withTheme,
  ListItem,
  Icon,
  SearchBar,
  Divider,
  Card,
} from "react-native-elements";
import * as SQLite from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import MySpinner from "../../components/MySpinnner";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import * as Tools from "../../core/Tools";
import { MAIN_URL } from "../../core/Constants";
import ShortUniqueId from "../../core/suuid";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Location from "expo-location";

export default function CollectPackage({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(false);
  const netInfo = useNetInfo();
  const db = SQLite.openDatabase("db.mzigohuoo");
  const payload = route.params;
  const sendingPackageId = payload.sending_package_id;
  const [packageStatus, setPackageStatus] = useState(
    payload.sending_package_status
  );
  const [myBase, setMyBase] = useState("");
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");
  const [packageDescription, setPackageDescription] = useState(
    payload.package_description
  );
  const [packageQty, setPackageQty] = useState(payload.package_qty);

  const fetchUserData = () => {
    db.transaction((tx) => {
      // sending 4 arguments in executeSql
      tx.executeSql(
        "SELECT * FROM users ",
        null,
        (txObj, rs) => {
          if (rs.rows.length > 0) {
            let my_row = rs.rows.item(0);
            setMyBase(my_row.my_base);
            setUserId(my_row.user_id);
            setUsername(my_row.username);
          }
        },
        (txObj, error) => console.log("FetchUserError", error)
      );
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const showAlert = (title, msg) =>
    Alert.alert(
      title,
      msg,
      [
        {
          text: "OK",
          style: "OK",
        },
      ],
      {
        cancelable: true,
      }
    );

const confirmAlert1 = (title, msg,okFun,cancelFun) => {
      Alert.alert(
          title,
          msg,
          [
              {
                  text: "YES",
                  style: "ok",
                  onPress: okFun
              },
                {
                  text: "NO",
                  style: "cancel",
                  onPress: cancelFun
              },
          ],
          {
              cancelable: true,
          }
      );
  };

  const uploadReceivePackageDetails = () => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/runReceivePackage";
      let form_data = {
        receipt_no: payload.receipt_no,
        received_package_description: packageDescription,
        received_package_qty: packageQty,
        created_by: userId,
        edited_by: userId,
      };
      fetch(url, {
        method: "POST",
        body: JSON.stringify(form_data),
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.matokeo == "success") {
            setPackageStatus("ARRIVED");
            showAlert("Success", "Package Successfully Received");
            clearInputsReceiving();
            setIsLoading(false);
          } else if (responseJson.matokeo == "failed") {
            setIsLoading(false);
            showAlert(
              "Data Upload Error",
              "Download Not Successful\n" + responseJson.fb_msg
            );
          }
        })
        .catch((error) => {
          setIsLoading(false);
          console.log(error);
          if (error.name === "AbortError") {
            showAlert(
              "Network or Data Error",
              "Please Check Your Internet Connection"
            );
          } else {
            showAlert(
              "Network Failure",
              "Please Check Your Internet Connection"
            );
          }
        });
    } else {
      showAlert(
        "Network or Server Error",
        "Please Check Your Internet Connection OR Check with Admin!"
      );
    }
  };

  const checkMTInputsReceiving = () => {
    if (packageDescription.length == 0) {
      showAlert("Error Inputs", "Please Check Package Description!");
      return false;
    } else if (packageQty.length == 0) {
      showAlert("Error Inputs", "Please Check Package Qty");
      return false;
    }
    return true;
  };

  const clearInputsReceiving = () => {
    setPackageDescription("");
    setPackageQty("");
  };
  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
      {isLoading ? <MySpinner /> : null}
      <ScrollView>
        <ListItem bottomDivider>
          <ListItem.Content>
            <ListItem.Title style={{ fontWeight: "bold" }}>
              {"Receipt No: " + payload.receipt_no}
            </ListItem.Title>
            <ListItem.Title>
              <Divider style={{ backgroundColor: "#E8E8E8" }} />
            </ListItem.Title>
            <ListItem.Title>
              <Text style={{ fontWeight: "bold" }}>City From: </Text>
              {payload.city_from}
            </ListItem.Title>
             <ListItem.Title>
              <Text style={{ fontWeight: "bold" }}>Sender: </Text>
              {payload.sender_name}
            </ListItem.Title>
            
            <ListItem.Title>
              <Text style={{ fontWeight: "bold" }}>City To: </Text>
              {payload.city_to}
            </ListItem.Title>
            <ListItem.Title>
              <Text style={{ fontWeight: "bold" }}>Receiver: </Text>
              {payload.receiver_name}
            </ListItem.Title>
            <ListItem.Title>
              <Text style={{ fontWeight: "bold" }}>Date & Time Sent: </Text>
              {payload.date_received + " " + payload.time_received}
            </ListItem.Title>
            <ListItem.Title>
              <Text style={{ fontWeight: "bold" }}>Package Status: </Text>
              {packageStatus}
            </ListItem.Title>
          </ListItem.Content>
        </ListItem>
        <Divider style={{ backgroundColor: "#FF9900" }} />
        {packageStatus == "IN TRANSIT" && (
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 10,
                textAlign: "center",
                marginBottom: 10,
                marginTop: 10,
              }}
            >
              Package Receiving Data
            </Text>
            <Input
              label="Package Description"
              value={packageDescription}
              multiline={true}
              labelStyle={styles.myLabel}
              inputStyle={styles.myInputStyle}
              onChangeText={(val) => setPackageDescription(val)}
            />
            <Input
              label="QTY"
              value={packageQty}
              labelStyle={styles.myLabel}
              inputStyle={[styles.myInputStyle, { textAlign: "center" }]}
              onChangeText={(val) => {
                setPackageQty(val);
              }}
              keyboardType="decimal-pad"
            />

            <Button
              title={"Receive"}
              onPress={() => {
                if (checkMTInputsReceiving()) {
                  //uploadReceivePackageDetails();
                  confirmAlert1("Confirm Update","Do you want to Complete This Action?",uploadReceivePackageDetails,null)
                }
              }}
              buttonStyle={{
                margin: 10,
                marginTop: 20,
                borderRadius: 0,
                backgroundColor: "#FF9900",
              }}
              containerStyle={styles.btnStyle}
            />
          </View>
        )}
      </ScrollView>
      <View style={{ flexDirection: "row", padding: 5, height: 50 }}>
        <View style={{ flex: 1 }}>
          <Button
            buttonStyle={{
              margin: 2,
              borderRadius: 0,
              backgroundColor: "#FF9900",
            }}
            icon={<Icon name="home" type="font-awesome" color="#fff" />}
            onPress={() => {
              navigation.navigate("DashboardDrawer", { screen: "Dashboard" });
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            buttonStyle={{
              margin: 2,
              borderRadius: 0,
              backgroundColor: "#FF9900",
            }}
            icon={<Icon name="package" type="octicon" color="#fff" />}
            onPress={() => {
              navigation.navigate("AllPackages");
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            buttonStyle={{
              margin: 2,
              borderRadius: 0,
              backgroundColor: "#FF9900",
            }}
            icon={<Icon name="qrcode" type="font-awesome" color="#fff" />}
            onPress={() => {
              navigation.navigate("ScanPackage");
            }}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  myLabel: {
    fontSize: 15,
    fontWeight: "normal",
    color: "#000",
    textAlign: "center",
  },
  myInputStyle: {
    fontSize: 15,
    fontWeight: "normal",
    color: "#000",
    textAlign: "center",
  },
});
