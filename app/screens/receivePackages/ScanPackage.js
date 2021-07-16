import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert, ScrollView } from "react-native";
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
} from "react-native-elements";
import { BarCodeScanner } from "expo-barcode-scanner";
import MySpinner from "../../components/MySpinnner";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import * as Tools from "../../core/Tools";
import { MAIN_URL } from "../../core/Constants";
import { useFocusEffect } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";
import { Picker } from "@react-native-picker/picker";

export default function ScanPackage({ navigation, route }) {
  const netInfo = useNetInfo();
  const db = SQLite.openDatabase("db.mzigohuoo");
  Tools.updateDBWhereAt(
    db,
    "ReceivePackageStack",
    "ScanPackage",
    new Date().toISOString().slice(0, 10),
    1
  );

  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("Not yet scanned");
  const [receiptNo, setReceiptNo] = useState("");
  const [packageStatus, setPackageStatus] = useState("");
  const [cityFrom, setCityFrom] = useState("");
  const [cityTo, setCityTo] = useState("");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [cityFromName, setCityFromName] = useState("");
  const [cityToName, setCityToName] = useState("");
  const [dateReceived, setDateReceived] = useState("");
  const [timeReceived, setTimeReceived] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageQty, setPackageQty] = useState("");

  const [collectedByName, setCollectedByName] = useState("");
  const [collectedByContacts, setCollectedByContacts] = useState("");
  const [collectedByIdNo, setCollectedByIdNo] = useState("");
  const [collectedByIdType, setCollectedByIdType] = useState("");

  const [sendingPackageId, setSendingPackageId] = useState(0);
  const [myBase, setMyBase] = useState("");
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");

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

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(data);
    setReceiptNo(data);
    console.log("Type: " + type + "\nData: " + data);
    getPackagedDetails2(data);
  };

  const showAlert = (title, msg) => {
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
  };

  const confirmAlert1 = (title, msg, okFun, cancelFun) => {
    Alert.alert(
      title,
      msg,
      [
        {
          text: "YES",
          style: "ok",
          onPress: okFun,
        },
        {
          text: "NO",
          style: "cancel",
          onPress: cancelFun,
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  const getPackagedDetails2 = (receiptNo2) => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/runScanPackage";
      let form_data = { receipt_no: receiptNo2 };
      fetch(url, {
        method: "POST",
        body: JSON.stringify(form_data),
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.matokeo == "success") {
            console.log("success");
            let rs_package_details = responseJson.rs_package_details;
            console.log(rs_package_details);
            setSendingPackageId(rs_package_details[0].sending_package_id);
            setPackageStatus(rs_package_details[0].sending_package_status);
            setCityFrom(rs_package_details[0].city_from);
            setCityTo(rs_package_details[0].city_to);
            setDateReceived(rs_package_details[0].date_received);
            setTimeReceived(rs_package_details[0].time_received);
            setPackageDescription(rs_package_details[0].package_description);
            setPackageQty(rs_package_details[0].package_qty);
            setSenderName(rs_package_details[0].sender_name);
            setReceiverName(rs_package_details[0].receiver_name);
            setCollectedByName(rs_package_details[0].receiver_name);
            setCollectedByContacts(rs_package_details[0].receiver_contacts);

            setIsLoading(false);
          } else if (responseJson.matokeo == "failed") {
            setIsLoading(false);
            showAlert("Data Error", responseJson.fb_msg);
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

  const resetVals = () => {
    setPackageStatus("");
    setReceiptNo("");
    setCityFrom("");
    setCityTo("");
    setDateReceived("");
    setTimeReceived("");
    setSenderName("");
    setReceiverName("");
  };

  const uploadTransitUpdate = () => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/runTransitPackage";
      let form_data = {
        receipt_no: receiptNo,
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
            setPackageStatus("IN TRANSIT");
            showAlert("Success", "Package Successfully Updated");

            setIsLoading(false);
          } else if (responseJson.matokeo == "failed") {
            setIsLoading(false);
            showAlert(
              "Data Upload Error",
              "Update Not Successful\n" + responseJson.fb_msg
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

  const uploadReceivePackageDetails = () => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/runReceivePackage";
      let form_data = {
        receipt_no: receiptNo,
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

  const checkMTInputsCollection = () => {
    if (collectedByName.length == 0) {
      showAlert("Error Inputs", "Please Enter Collected By!");
      return false;
    } else if (collectedByContacts.length == 0) {
      showAlert("Error Inputs", "Please Enter Collected By Contacts");
      return false;
    } else if (collectedByIdNo.length == 0) {
      showAlert("Error Inputs", "Please Check ID No!");
      return false;
    } else if (collectedByIdType.length == 0) {
      showAlert("Error Inputs", "Please Check ID Type!");
      return false;
    }
    return true;
  };
  const clearInputsCollection = () => {
    setCollectedByName("");
    setCollectedByContacts("");
    setCollectedByIdNo("");
    setCollectedByIdType("");
  };

  const uploadCollectPackageDetails = () => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/runCollectPackage";
      let form_data = {
        receipt_no: receiptNo,
        collected_by_name: collectedByName,
        collected_by_contacts: collectedByContacts,
        collected_by_idno: collectedByIdNo,
        collected_by_id_type: collectedByIdType,
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
          console.log(responseJson);
          if (responseJson.matokeo == "success") {
            setPackageStatus("COLLECTED");
            showAlert("Success", "Package Successfully Collected");
            clearInputsCollection();

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

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
        <View style={styles.container}>
          <Text>Checking Camera permission</Text>
        </View>
      </SafeAreaProvider>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        {isLoading ? <MySpinner /> : null}
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button
          title={"Allow Camera"}
          onPress={() => askForCameraPermission()}
        />
      </View>
    );
  }

  // Return the View
  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
      <ScrollView>
        {isLoading ? <MySpinner /> : null}
        <View style={styles.barCodeContainer}>
          <View style={styles.barcodebox}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={{ height: 400, width: 400 }}
            />
          </View>
        </View>
        <View>
          <ListItem bottomDivider>
            <ListItem.Content>
              <ListItem.Title style={{ fontWeight: "bold" }}>
                {"Receipt No: " + receiptNo}
              </ListItem.Title>
              <ListItem.Title>
                <Divider style={{ backgroundColor: "#E8E8E8" }} />
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>City From: </Text>
                {cityFrom}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>Sender: </Text>
                {senderName}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>City To: </Text>
                {cityTo}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>Receiver: </Text>
                {receiverName}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>Date & Time Sent: </Text>
                {dateReceived + " " + timeReceived}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>Package Status: </Text>
                {packageStatus}
              </ListItem.Title>
            </ListItem.Content>
          </ListItem>
        </View>

        {scanned && (
          <Button
            title={"Scan again?"}
            onPress={() => {
              setScanned(false);
              resetVals();
            }}
            buttonStyle={{
              margin: 2,
              borderRadius: 0,
              backgroundColor: "#FF9900",
            }}
            containerStyle={styles.btnStyle}
          />
        )}
        <Divider style={{ backgroundColor: "#FF9900" }} />
        {packageStatus == "DROP OFF" && (
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 10,
                textAlign: "center",
              }}
            >
              Update Transit Status
            </Text>

            <Button
              title={"Transit"}
              onPress={() => {
                confirmAlert1(
                  "Confirm Update",
                  "Do you want to Complete This Action?",
                  uploadTransitUpdate,
                  null
                );
              }}
              buttonStyle={{
                margin: 2,
                borderRadius: 0,
                backgroundColor: "#FF9900",
              }}
              containerStyle={styles.btnStyle}
            />
          </View>
        )}
        {packageStatus == "IN TRANSIT" && (
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 10,
                textAlign: "center",
              }}
            >
              Receiving Data Details
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
                  confirmAlert1(
                    "Confirm Update",
                    "Do you want to Complete This Action?",
                    uploadReceivePackageDetails,
                    null
                  );
                  //onPress={()=>{confirmAlert1("Confirm Delete","This Will Delete All Your Open Errands!",deleAll,null)}}
                }
              }}
              buttonStyle={{
                margin: 2,
                borderRadius: 0,
                backgroundColor: "#FF9900",
              }}
              containerStyle={styles.btnStyle}
            />
          </View>
        )}
        {packageStatus == "ARRIVED" && (
          <View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginLeft: 10,
                textAlign: "center",
              }}
            >
              Collection Data Details
            </Text>
            <Input
              label="Collected By"
              value={collectedByName}
              labelStyle={styles.myLabel}
              inputStyle={styles.myInputStyle}
              onChangeText={(val) => setCollectedByName(val)}
            />
            <Input
              label="Collected By Contacts"
              value={collectedByContacts}
              labelStyle={styles.myLabel}
              inputStyle={styles.myInputStyle}
              onChangeText={(val) => setCollectedByContacts(val)}
              keyboardType="phone-pad"
            />
            <Input
              label="ID No"
              value={collectedByIdNo}
              labelStyle={styles.myLabel}
              inputStyle={styles.myInputStyle}
              onChangeText={(val) => setCollectedByIdNo(val)}
            />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View
                style={{
                  borderBottomWidth: 1,
                  height: 62,
                  borderBottomColor: "#545454",
                  marginRight: 5,
                }}
              >
                <Text style={(styles.myLabel, { textAlign: "center" })}>
                  ID Type
                </Text>
                <Picker
                  style={styles.myInputStyle}
                  selectedValue={collectedByIdType}
                  onValueChange={(val, ind) => {
                    setCollectedByIdType(val);
                  }}
                  prompt={"ID Type"}
                >
                  <Picker.Item label="" value="" />
                  <Picker.Item label="NATIONAL ID" value="NATIONAL ID" />
                  <Picker.Item
                    label="DRIVERS LICENSE"
                    value="DRIVERS LICENSE"
                  />
                  <Picker.Item label="PASSPORT" value="PASSPORT" />
                  <Picker.Item label="VOTERS CARD" value="VOTERS CARD" />
                  <Picker.Item label="WORK ID" value="WORK ID" />
                  <Picker.Item label="OTHER" value="OTHER" />
                </Picker>
              </View>
            </View>

            <Button
              title={"Collect"}
              onPress={() => {
                if (checkMTInputsCollection()) {
                  confirmAlert1(
                    "Confirm Update",
                    "Do you want to Complete This Action?",
                    uploadCollectPackageDetails,
                    null
                  );
                }
              }}
              buttonStyle={{
                margin: 2,
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  barCodeContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    marginTop: 10,
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 0,
    backgroundColor: "#FF9900",
  },
  btnStyle: {
    margin: 10,
    width: "95%",
  },
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
