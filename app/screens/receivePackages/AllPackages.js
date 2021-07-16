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
} from "react-native-elements";
import * as SQLite from "expo-sqlite";
import { useFocusEffect } from "@react-navigation/native";
import MySpinner from "../../components/MySpinnner";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import * as Tools from "../../core/Tools";
import { MAIN_URL } from "../../core/Constants";
//import { addMyErrands } from '../../core/DB';

export default function AllPackages({ navigation, route }) {
  const netInfo = useNetInfo();
  const db = SQLite.openDatabase("db.mzigohuoo");
  Tools.updateDBWhereAt(
    db,
    "ReceivePackageStack",
    "AllPackages",
    new Date().toISOString().slice(0, 10),
    1
  );

  const [myBase, setMyBase] = useState("");
  const [userId, setUserId] = useState(0);
  const [username, setUsername] = useState("");
  
  const [allPackages, setAllPackages] = useState([]);
  const [filteredAllPackages, setFilteredAllPackages] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


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

  //METHODS 1:
  const onSearch = (text) => {
    if (text) {
      const filteredData = allPackages.filter((item) => {
        const itemData = item.receipt_no ? item.receipt_no.toLowerCase() : "";
        return itemData.indexOf(text.toLowerCase()) > -1;
      });
      setFilteredAllPackages(filteredData);
      setSearchTerm(text);
    } else {
      setFilteredAllPackages(allPackages);
      setSearchTerm(text);
    }
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
  const confirmTransit = (title, msg, da) => {
    Alert.alert(
      title,
      msg,
      [
        {
          text: "YES",
          style: "ok",
          onPress: () => {
            uploadTransitUpdate(da);
          },
        },
        {
          text: "NO",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      }
    );
  };

  //METHODS 2:

  const downloadAllPackages = () => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      console.log("alll");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/downloadAllPackages";
      let form_data = { username: username };
      fetch(url, {
        method: "POST",
        body: JSON.stringify(form_data),
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.matokeo == "success") {
            console.log("success");
            console.log(responseJson);
            let rs_all_packages = responseJson.rs_all_packages;
            setAllPackages(rs_all_packages);
            setFilteredAllPackages(rs_all_packages);

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
  useFocusEffect(
    React.useCallback(() => {
      downloadAllPackages();
    }, [])
  );

  const uploadTransitUpdate = (one) => {
    let connected = netInfo.isConnected && netInfo.isInternetReachable;
    if (connected || true) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      setIsLoading(true);
      let url = MAIN_URL + "/runTransitPackage";
      let form_data = {
        receipt_no: one.receipt_no,
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
            showAlert("Success", "Package Successfully Updated");
            downloadAllPackages();
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

  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
      <View>
        {isLoading ? <MySpinner /> : null}
        <SearchBar
          placeholder="Type Here..."
          value={searchTerm}
          onChangeText={(val) => {
            onSearch(val);
          }}
          keyboardType="decimal-pad"
        />
      </View>
      <ScrollView>
        {filteredAllPackages.map((item, i) => (
          <ListItem key={i} bottomDivider>
            <Text style={{ fontSize: 25 }}>{i + 1}</Text>
            <ListItem.Content>
              <ListItem.Title style={{ fontWeight: "bold" }}>
                {"Receipt No: " + item.receipt_no}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>City From: </Text>
                {item.city_from}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>City To: </Text>
                {item.city_to}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>Date & Time Sent: </Text>
                {item.date_received + " " + item.time_received}
              </ListItem.Title>
              <ListItem.Title>
                <Text style={{ fontWeight: "bold" }}>Package Status: </Text>
                {item.sending_package_status}
              </ListItem.Title>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 5,
                  backgroundColor: "#E8E8E8",
                  width: "100%",
                }}
              >
                <Button
                  icon={
                    item.sending_package_status == "DROP OFF" ? (
                      <Icon
                        name="truck-delivery"
                        type="material-community"
                        color={"#fff"}
                      />
                    ) : (
                      <Icon name="forward" type="font-awesome" color={"#fff"} />
                    )
                  }
                  buttonStyle={{
                    backgroundColor:
                      item.sending_package_status == "DROP OFF"
                        ? "#FF9900"
                        : "#FF9900",
                    borderRadius: 0,
                    width: 60,
                    marginLeft: 10,
                  }}
                  onPress={() => {
                    if (item.sending_package_status == "DROP OFF") {
                      confirmTransit(
                        "Confirm Transit",
                        "Do You Want To Complete This Action?",
                        item
                      );
                    } else if (item.sending_package_status == "IN TRANSIT") {
                      navigation.navigate("ReceivePackage", item);
                    } else if (item.sending_package_status == "ARRIVED") {
                      navigation.navigate("CollectPackage", item);
                    }
                  }}
                />
              </View>
            </ListItem.Content>
          </ListItem>
        ))}
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
        <View style={{ flex: 1 }}>
          <Button
            buttonStyle={{
              margin: 2,
              borderRadius: 0,
              backgroundColor: "#FF9900",
            }}
            icon={<Icon name="sync" type="octicon" color="#fff" />}
            onPress={() => {
              downloadAllPackages();
            }}
          />
        </View>
      </View>
    </SafeAreaProvider>
  );
}
