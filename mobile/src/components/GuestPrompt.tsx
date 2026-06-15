import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
  icon?: string;
  title: string;
  message: string;
  onLogin: () => void;
}

const GuestPrompt: React.FC<Props> = ({ icon = "🔒", title, message, onLogin }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.msg}>{message}</Text>
    <TouchableOpacity style={styles.btn} onPress={onLogin}>
      <Text style={styles.btnText}>Iniciar sesión</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30, backgroundColor: "#f7f7f8" },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", textAlign: "center" },
  msg: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 6, lineHeight: 20 },
  btn: { marginTop: 22, backgroundColor: "#ff6a00", paddingVertical: 14, paddingHorizontal: 36, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

export default GuestPrompt;
