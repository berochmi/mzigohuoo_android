import * as React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Icon } from "react-native-elements";
import Dashboard from "./Dashboard";
import ReceivePackageStack from "../receivePackages/ReceivePackageStack";

const Drawer = createDrawerNavigator();
export default function DashboardDrawer({ navigation, route }) {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      drawerStyle={{
        backgroundColor: "#fff",
      }}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#FF9900" },
        headerTintColor: "#fff",
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        initialParams={{ params: route.params }}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon
              name="tachometer"
              type="font-awesome"
              size={size}
              color={"#FF9900"}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="ReceivePackageStack"
        component={ReceivePackageStack}
        initialParams={{ params: route.params }}
        options={{
          drawerIcon: ({ color, size }) => (
            <Icon
              name="tachometer"
              type="font-awesome"
              size={size}
              color={"#FF9900"}
            />
          ),
          title: "Receive Packages",
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}
