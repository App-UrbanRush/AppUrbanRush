import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";

const AdminRedirectScreen = () => {
  const { logout, user } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛡️</Text>
      <Text style={styles.title}>Panel de administración</Text>
      <Text style={styles.text}>
        Hola {user?.email}. El panel admin (usuarios, auditoría, backups, archivos cifrados, reportes) está optimizado para web — usalo desde el navegador.
      </Text>
      <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("http://localhost:5173/admin/dashboard")}>
        <Text style={styles.btnText}>Abrir panel web</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={logout} style={{ marginTop: 16 }}>
        <Text style={styles.link}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center", backgroundColor: "#fff7f0" },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", marginBottom: 12, textAlign: "center" },
  text: { fontSize: 14, color: "#555", textAlign: "center", lineHeight: 21, marginBottom: 22 },
  btn: { backgroundColor: "#ff6a00", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  link: { color: "#ff3d6e", fontWeight: "700" },
});

export default AdminRedirectScreen;
