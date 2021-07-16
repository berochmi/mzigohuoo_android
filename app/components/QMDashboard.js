import React from "react";
import { View } from "react-native";
import { Icon, Button } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import * as SQLite from "expo-sqlite";

export default function QMDashboard() {
  const navigation = useNavigation();
  const db = SQLite.openDatabase("db.mzigohuoo");
  const logout = () => {
    let sql = "update users set logged_in = 0;";
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        null,
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            navigation.navigate("Login");
          }
        },
        (txObj, error) => {}
      );
    });
  };

  return (
    <View style={{ flexDirection: "row", marginBottom: 5, padding: 5 }}>
      <View style={{ flex: 1 }}>
        <Button
          buttonStyle={{
            margin: 2,
            borderRadius: 0,
            backgroundColor: "#FF9900",
          }}
          icon={
            <Icon name="qrcode" type="font-awesome" size={30} color="#fff" />
          }
          onPress={() =>
            navigation.navigate("ReceivePackageStack", {
              screen: "ScanPackage",
            })
          }
        />
      </View>
      <View style={{ flex: 1 }}>
        <Button
          buttonStyle={{
            margin: 2,
            borderRadius: 0,
            backgroundColor: "#FF9900",
          }}
          icon={<Icon name="package" type="octicon" size={30} color="#fff" />}
          onPress={() => {
            navigation.navigate("ReceivePackageStack", {
              screen: "AllPackages",
            });
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Button
          buttonStyle={{
            margin: 2,
            borderRadius: 0,
            backgroundColor: "#545454",
          }}
          icon={
            <Icon
              name="logout"
              type="material-community"
              size={30}
              color="#fff"
            />
          }
          onPress={() => {
            logout();
          }}
        />
      </View>
    </View>
  );
}
