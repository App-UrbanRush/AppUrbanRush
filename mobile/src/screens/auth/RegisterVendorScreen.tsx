import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const RegisterVendorScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text style={styles.icon}>🏪</Text>
    <Text style={styles.title}>Registro de negocio</Text>
    <Text style={styles.text}>
      Para registrar tu negocio necesitás subir documentos (cédula, NIT, fotos del local) que se gestionan mejor desde la versión web.
    </Text>
    <Text style={styles.text}>
      Una vez aprobado el negocio, podés gestionar pedidos y productos desde esta app.
    </Text>
    <TouchableOpacity style={styles.btn} onPress={() => Linking.openURL("http://localhost:5173/vendor-register")}>
      <Text style={styles.btnText}>Abrir versión web</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => navigation.goBack()}>
      <Text style={styles.link}>← Volver</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center", backgroundColor: "#fff7f0" },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", marginBottom: 12, textAlign: "center" },
  text: { fontSize: 14, color: "#555", textAlign: "center", lineHeight: 21, marginBottom: 14 },
  btn: { marginTop: 12, backgroundColor: "#ff6a00", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12 },
  btnText: { color: "#fff", fontWeight: "700" },
  link: { marginTop: 18, color: "#ff6a00", fontWeight: "700" },
});

export default RegisterVendorScreen;
