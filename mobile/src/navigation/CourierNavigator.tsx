import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import CourierHomeScreen from "../screens/courier/CourierHomeScreen";
import ActiveDeliveryScreen from "../screens/courier/ActiveDeliveryScreen";
import EarningsScreen from "../screens/courier/EarningsScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import NotificationBell from "../components/NotificationBell";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: "#ff6a00" } as const,
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "800" } as const,
  headerRight: () => <NotificationBell />,
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CourierHome" component={CourierHomeScreen} />
    <Stack.Screen name="ActiveDelivery" component={ActiveDeliveryScreen}
      options={{ headerShown: true, ...headerOptions, title: "Entrega en curso" }} />
  </Stack.Navigator>
);

const CourierNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#ff6a00",
      tabBarInactiveTintColor: "#999",
      tabBarStyle: { paddingTop: 4, paddingBottom: 4, height: 60 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      tabBarIcon: ({ color, size }) => {
        const map: Record<string, keyof typeof Ionicons.glyphMap> = {
          Home: "bicycle-outline",
          Earnings: "wallet-outline",
          Profile: "person-outline",
        };
        return <Ionicons name={map[route.name] ?? "ellipse-outline"} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: "Pedidos" }} />
    <Tab.Screen name="Earnings" component={EarningsScreen} options={{ title: "Ganancias", headerShown: true, ...headerOptions }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil", headerShown: true, ...headerOptions }} />
  </Tab.Navigator>
);

export default CourierNavigator;
