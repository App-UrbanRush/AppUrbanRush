import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/customer/HomeScreen";
import StoresScreen from "../screens/customer/StoresScreen";
import StoreDetailScreen from "../screens/customer/StoreDetailScreen";
import CartScreen from "../screens/customer/CartScreen";
import CheckoutScreen from "../screens/customer/CheckoutScreen";
import MyOrdersScreen from "../screens/customer/MyOrdersScreen";
import TrackingScreen from "../screens/customer/TrackingScreen";
import ProfileScreen from "../screens/customer/ProfileScreen";
import FavoritesScreen from "../screens/customer/FavoritesScreen";
import IntelligenceScreen from "../screens/customer/IntelligenceScreen";
import AuthNavigator from "./AuthNavigator";
import NotificationBell from "../components/NotificationBell";
import { useAuth } from "../auth/AuthContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: "#ff6a00" } as const,
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "800" } as const,
  headerRight: () => <NotificationBell />,
};

const HomeStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: "UrbanRush" }} />
    <Stack.Screen name="Stores" component={StoresScreen} options={{ title: "Tiendas" }} />
    <Stack.Screen name="StoreDetail" component={StoreDetailScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const StoresStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="StoresMain" component={StoresScreen} options={{ title: "Tiendas" }} />
    <Stack.Screen name="StoreDetail" component={StoreDetailScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const CartStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="CartMain" component={CartScreen} options={{ title: "Carrito" }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Confirmar pedido" }} />
  </Stack.Navigator>
);

const OrdersStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="OrdersMain" component={MyOrdersScreen} options={{ title: "Mis pedidos" }} />
    <Stack.Screen name="Tracking" component={TrackingScreen} options={{ title: "Seguimiento" }} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Mi perfil" }} />
    <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Favoritos" }} />
    <Stack.Screen name="Intelligence" component={IntelligenceScreen} options={{ title: "🧠 IA" }} />
  </Stack.Navigator>
);

const Tabs = () => {
  const { token } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff6a00",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { paddingTop: 4, paddingBottom: 4, height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, keyof typeof Ionicons.glyphMap> = {
            Home: "home-outline",
            Stores: "storefront-outline",
            Cart: "cart-outline",
            Orders: "receipt-outline",
            Profile: token ? "person-outline" : "log-in-outline",
          };
          return <Ionicons name={map[route.name] ?? "ellipse-outline"} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: "Inicio" }} />
      <Tab.Screen name="Stores" component={StoresStack} options={{ title: "Tiendas" }} />
      <Tab.Screen name="Cart" component={CartStack} options={{ title: "Carrito" }} />
      <Tab.Screen name="Orders" component={OrdersStack} options={{ title: "Pedidos" }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: token ? "Perfil" : "Entrar" }} />
    </Tab.Navigator>
  );
};

/**
 * Stack raíz para el cliente. Permite mostrar el flujo de login como
 * modal por encima del tab navigator cuando el visitante necesita
 * autenticarse (al pagar, ver pedidos, etc.).
 */
const CustomerNavigator = () => (
  <RootStack.Navigator screenOptions={{ headerShown: false }}>
    <RootStack.Screen name="Tabs" component={Tabs} />
    <RootStack.Screen
      name="Auth"
      component={AuthNavigator}
      options={{ presentation: "modal", animation: "slide_from_bottom" }}
    />
  </RootStack.Navigator>
);

export default CustomerNavigator;
