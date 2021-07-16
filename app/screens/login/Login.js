import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import { Button, Input, Header, Image } from "react-native-elements";
import * as SQLite from "expo-sqlite";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { Base64 } from "js-base64";
import { useFocusEffect } from "@react-navigation/native";
import * as Tools from "../../core/Tools";
import { MAIN_URL } from "../../core/Constants";
import MySpinner from "../../components/MySpinnner";
import ShortUniqueId from "../../core/suuid";
import { compareAsc, format } from "date-fns";

export default function Login({ navigation }) {
  const uid = new ShortUniqueId();
  console.log(format(new Date(), "yyyy-MM-dd HH:mm:ss"));
  const netInfo = useNetInfo();
  const db = SQLite.openDatabase("db.mzigohuoo");
  const logo = require("../../../assets/logo_4.png");

  const [username, setUsername] = useState("");
  const [savedUsername, setSavedUsername] = useState("");
  const [username_ph, setUsernamePH] = useState("Username");
  const [password, setPassword] = useState("");
  const [encodedPassword, setEncodedPassword] = useState("");
  const [password_ph, setPasswordPH] = useState("Password");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isUser, setIsUser] = useState(false);

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

  let updateDB = false;
  let create_users =
    "CREATE TABLE IF NOT EXISTS users (id INTEGER unique PRIMARY KEY," +
    " user_id integer,f_name text ,l_name TEXT,m_name text, username text,my_base text,my_branch_id integer,password text,user_group_id integer, role text," +
    " deleted integer,logged_in integer default 0,last_stack text default null,last_screen text default null,last_date text default null);";

  const fetchUserData = () => {
    db.transaction((tx) => {
      // sending 4 arguments in executeSql
      tx.executeSql(
        "SELECT * FROM users where username = ? and password = ?  order by id desc",
        [username, encodedPassword],
        (txObj, rs) => {
          if (rs.rows.length > 0) {
            setIsLoading(false);
            navigation.navigate("DashboardDrawer");
          } else {
            console.log("User Information Not Saved");
            showAlert(
              "Error Login",
              "User Information Not Saved Or Wrong Username & Password"
            );
            setIsLoading(false);
          }
        },
        (txObj, error) => console.log("Error", error)
      );
    });
  };

  const fetchUserData2 = () => {
    db.transaction((tx) => {
      // sending 4 arguments in executeSql
      tx.executeSql(
        "SELECT * FROM users; ",
        null,
        (txObj, rs) => {
          let my_row = null;
          console.log(rs.rows._array);
          if (rs.rows.length > 0) {
            my_row = rs.rows.item(0);
            setUsername(my_row.username);
            setSavedUsername(my_row.username);
            setPassword(Base64.decode(my_row.password));
            setEncodedPassword(my_row.password);
            let diff_days = Tools.diffDays(
              Tools.currentDate(),
              my_row.last_date
            );
            if (my_row.logged_in == 1 && diff_days == 0) {
              if (
                (my_row.last_stack.length != 0 || my_row.last_stack != null) &&
                (my_row.last_screen.length != 0 || my_row.last_screen != null)
              ) {
                navigation.navigate("DashboardDrawer", {
                  screen: my_row.last_stack,
                  params: { screen: my_row.last_screen },
                });
              } else {
                navigation.navigate("DashboardDrawer");
              }
            }
          }
        },
        (txObj, error) => console.log("FetchUserError", error)
      );
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData2();
    }, [])
  );

  const createUsers = () => {
    if (updateDB) {
      db.transaction((tx) => {
        tx.executeSql("drop table if exists users");
      });
    }
    db.transaction((tx) => {
      tx.executeSql(create_users, null, null, (txObj, error) =>
        console.log("UserError", error)
      );
    });
  };

  const checkMTInputs = () => {
    if (username.length == 0) {
      showAlert("Error Inputs", "Please Enter Your Username!");
      return false;
    } else if (password.length == 0) {
      showAlert("Error Inputs", "Please Enter Your Password!");
      return false;
    } else if (savedUsername.length > 0 && savedUsername != username) {
      showAlert("Error Inputs", "Username Not Registered!");
      return false;
    }
    return true;
  };

  const addUsers = (user) => {
    let da1 = [
      100,
      user.user_id,
      user.f_name,
      user.l_name,
      user.m_name,
      user.username,
      user.my_base,
      user.my_branch_id,
      encodedPassword,
      user.user_group_id,
      user.user_group_name,
      user.deleted,
      1,
    ];
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT OR IGNORE INTO users (id,user_id,f_name ,l_name,m_name, username,my_base,my_branch_id,password,user_group_id, role, " +
          "deleted,logged_in)values (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        da1,
        (txObj, resultSet) => {},
        (txObj, error) => console.log("Error", error)
      );
    });
  };

  const setupDB = () => {
    setIsLoading(true);
    createUsers();
    let connected = netInfo.isConnected && netInfo.isInternetReachable;

    if (connected) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      let url = MAIN_URL + "/runSetUp";
      console.log("Start");
      let form_data = { username: username, password: password };
      fetch(url, {
        method: "POST",
        body: JSON.stringify(form_data),
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.matokeo == "success") {
            console.log("Success To Login");
            //console.log(responseJson);
            let users = responseJson.rs_user_details;
            //console.log(errand_tasks);
            //rs_errand_tasks
            for (let i = 0; i < users.length; i++) {
              addUsers(users[i]);
            }
            navigation.navigate("DashboardDrawer");
          } else if (responseJson.matokeo == "failed") {
            console.log("Failed To Login");
            //console.log(responseJson);
            showAlert(
              "Error Login",
              "User Information Not Saved Or Wrong Username & Password"
            );
          }
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            showAlert(
              "Network or Data Error",
              "Please Check Your Internet Connection, Switching to in Offline Mode"
            );
            //fetchUserData();
          } else {
            console.error(error);
            showAlert(
              "Network Failure!",
              "Please Check Your Internet Connection"
            );
            //fetchUserData();
          }
          setIsLoading(false);
          console.error(error);
        });
    } else {
      //fetchUserData();
      showAlert("Network Failure!", "Please Check Your Internet Connection");
      fetchUserData();
    }
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: "#fff" }}>
      {isLoading ? <MySpinner /> : null}

      <View style={styles.container}>
        <View style={styles.imageLogo}>
          <Image source={logo} style={{ width: 240, height: 250 }} />
        </View>
        <Input
          inputStyle={styles.loginInp}
          placeholder={username_ph}
          value={username}
          onChangeText={(val) => setUsername(val)}
        />

        <Input
          inputStyle={styles.loginInp}
          placeholder={password_ph}
          value={password}
          secureTextEntry={true}
          onChangeText={(val) => {
            setPassword(val);
            setEncodedPassword(Base64.encode(val));
          }}
        />

        <Button
          onPress={() => {
            if (checkMTInputs()) {
              setupDB();
            }
          }}
          containerStyle={styles.loginBtn}
          buttonStyle={{ backgroundColor: "#FF9900", borderRadius: 0 }}
          title="Login"
        />
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
    marginBottom: 50,
  },
  imageLogo: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  loginBtn: {
    margin: 10,
    width: "95%",
  },
  loginInp: {
    textAlign: "center",
  },
  container2: {
    flex: 5,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});
