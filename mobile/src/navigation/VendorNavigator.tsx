import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import VendorOrdersScreen from "../screens/vendor/VendorOrdersScreen";
import VendorProductsScreen from "../screens/vendor/VendorProductsScreen";
import VendorAnalyticsScreen from "../screens/vendor/VendorAnalyticsScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import NotificationBell from "../components/NotificationBell";

const Tab = createBottomTabNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: "#ff6a00" } as const,
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "800" } as const,
  headerRight: () => <NotificationBell />,
};

const VendorNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarActiveTintColor: "#ff6a00",
      tabBarInactiveTintColor: "#999",
      tabBarStyle: { paddingTop: 4, paddingBottom: 4, height: 60 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      tabBarIcon: ({ color, size }) => {
        const map: Record<string, keyof typeof Ionicons.glyphMap> = {
          Orders: "receipt-outline",
          Products: "fast-food-outline",
          Analytics: "analytics-outline",
          Profile: "person-outline",
        };
        return <Ionicons name={map[route.name] ?? "ellipse-outline"} size={size} color={color} />;
      },
      ...headerOptions,
    })}
  >
    <Tab.Screen name="Orders" component={VendorOrdersScreen} options={{ title: "Pedidos", headerShown: false }} />
    <Tab.Screen name="Products" component={VendorProductsScreen} options={{ title: "Productos", headerShown: false }} />
    <Tab.Screen name="Analytics" component={VendorAnalyticsScreen} options={{ title: "Analítica" }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
  </Tab.Navigator>
);

export default VendorNavigator;
