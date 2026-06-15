import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterSelectScreen from "../screens/auth/RegisterSelectScreen";
import RegisterCustomerScreen from "../screens/auth/RegisterCustomerScreen";
import RegisterCourierScreen from "../screens/auth/RegisterCourierScreen";
import RegisterVendorScreen from "../screens/auth/RegisterVendorScreen";

const Stack = createNativeStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="RegisterSelect" component={RegisterSelectScreen} />
    <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
    <Stack.Screen name="RegisterCourier" component={RegisterCourierScreen} />
    <Stack.Screen name="RegisterVendor" component={RegisterVendorScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
