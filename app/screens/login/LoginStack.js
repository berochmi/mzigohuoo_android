import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./Login";
import DashboardDrawer from "./DashboardDrawer";
import React from "react";
import MainHeader from "../../components/MainHeader";

const Stack = createStackNavigator();

function LoginStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerTitle: () => <MainHeader title="MzigoHuoo!" />,
            headerStyle: { backgroundColor: "#FF9900", height: 80 },
          }}
        />
        <Stack.Screen
          name="DashboardDrawer"
          component={DashboardDrawer}
          options={{
            title: "",
            headerStyle: { backgroundColor: "#FF9900", height: 0 },
            headerLeft: "",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default LoginStack;
