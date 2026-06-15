import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import AuthNavigator from "./AuthNavigator";
import CustomerNavigator from "./CustomerNavigator";
import CourierNavigator from "./CourierNavigator";
import VendorNavigator from "./VendorNavigator";
import AdminRedirectScreen from "../screens/admin/AdminRedirectScreen";
import ChatbotFAB from "../components/ChatbotFAB";

const AppNavigator = () => {
  const { token, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ff6a00" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const renderNavigator = () => {
    // Si está logueado y es un rol especial, va a su panel
    if (token && user) {
      switch (user.role) {
        case "Domiciliario": return <CourierNavigator />;
        case "Negocio":      return <VendorNavigator />;
        case "Administrador":
        case "SuperAdmin":   return <AdminRedirectScreen />;
      }
    }
    // Visitante o cliente logueado → CustomerNavigator
    return <CustomerNavigator />;
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
      {/* Chatbot Urby flotante: visible en todas las pantallas */}
      <ChatbotFAB />
    </NavigationContainer>
  );
};

export default AppNavigator;
