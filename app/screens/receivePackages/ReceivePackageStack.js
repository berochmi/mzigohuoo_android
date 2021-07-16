import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ScanPackage from "./ScanPackage";
import AllPackages from "./AllPackages";
import ReceivePackage from "./ReceivePackage";
import CollectPackage from "./CollectPackage";

import React from "react";
import MyHeader from "../../components/MyHeader";
import LeftDrawer from "../../components/LeftDrawer";

const Stack = createStackNavigator();

function ReceivePackageStack() {
  return (
    <Stack.Navigator initialRouteName="ScanPackage">
      <Stack.Screen
        name="ScanPackage"
        component={ScanPackage}
        options={{
          headerTitle: () => <MyHeader title="Scan Package" />,
          headerStyle: { backgroundColor: "#FF9900", height: 84 },
          headerLeft: () => <LeftDrawer />,
        }}
      />
      <Stack.Screen
        name="AllPackages"
        component={AllPackages}
        options={{
          headerTitle: () => <MyHeader title="All Packages" />,
          headerStyle: { backgroundColor: "#FF9900", height: 84 },
          headerLeft: () => <LeftDrawer />,
        }}
      />
      <Stack.Screen
        name="ReceivePackage"
        component={ReceivePackage}
        options={{
          headerTitle: () => <MyHeader title="Receive Package" />,
          headerStyle: { backgroundColor: "#FF9900", height: 84 },
          headerLeft: () => <LeftDrawer />,
        }}
      />
      <Stack.Screen
        name="CollectPackage"
        component={CollectPackage}
        options={{
          headerTitle: () => <MyHeader title="Collect Package" />,
          headerStyle: { backgroundColor: "#FF9900", height: 84 },
          headerLeft: () => <LeftDrawer />,
        }}
      />
    </Stack.Navigator>
  );
}

export default ReceivePackageStack;
