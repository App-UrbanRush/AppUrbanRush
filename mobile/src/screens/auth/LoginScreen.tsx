import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { NEST_API } from "../../config/env";

const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Faltan datos", "Ingresá tu correo y contraseña");
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
      // Cerrar el modal de auth si estamos en él
      if (navigation?.canGoBack?.()) navigation.getParent()?.goBack();
    } catch (e: any) {
      const status = e?.response?.status;
      Alert.alert("No se pudo iniciar sesión",
        status === 401 || status === 400 ? "Correo o contraseña incorrectos" : "No se pudo conectar con el servidor");
    } finally { setBusy(false); }
  };

  const onGoogle = () => {
    Alert.alert(
      "Continuar con Google",
      "Vamos a abrir el navegador para que ingreses con Google. Una vez logueado, copiá tu correo y volvé a esta app para iniciar sesión con la misma cuenta.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Abrir Google", onPress: () => Linking.openURL(`${NEST_API}/auth/google`) },
      ],
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <View style={styles.brand}>
        <Image source={require("../../../assets/logo.png")} style={styles.brandLogo} resizeMode="contain" />
        <Text style={styles.brandTagline}>Entrega rápida a tu puerta</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>

        <Text style={styles.label}>Correo</Text>
        <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="tu@correo.com" placeholderTextColor="#aaa" />

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passWrap}>
          <TextInput style={[styles.input, { flex: 1, paddingRight: 50 }]} secureTextEntry={!showPass} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor="#aaa" />
          <TouchableOpacity style={styles.eye} onPress={() => setShowPass((v) => !v)}>
            <Text style={{ fontSize: 18 }}>{showPass ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btn, busy && { opacity: 0.7 }]} onPress={onSubmit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Entrar</Text>}
        </TouchableOpacity>

        {/* Nota: el login con Google solo está disponible en la versión web por ahora. */}

        <View style={styles.divider} />

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate("RegisterSelect")}>
          <Text style={styles.linkText}>Crear cuenta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ff6a00", justifyContent: "center", padding: 20 },
  brand: { alignItems: "center", marginBottom: 30 },
  brandLogo: { width: 300, height: 150 },
  brandTagline: { color: "#fff", opacity: 0.95, fontSize: 14, marginTop: 2, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 22, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 16, fontSize: 16, color: "#222", minHeight: 52 },
  passWrap: { position: "relative", justifyContent: "center" },
  eye: { position: "absolute", right: 12, padding: 4 },
  btn: { marginTop: 22, backgroundColor: "#ff6a00", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  orRow: { flexDirection: "row", alignItems: "center", marginVertical: 14, gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: "#e5e5e5" },
  orText: { color: "#999", fontSize: 12, fontWeight: "600" },

  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 12, borderRadius: 12,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#e0e0e0",
  },
  googleIcon: { width: 20, height: 20 },
  googleText: { color: "#444", fontWeight: "700", fontSize: 14 },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 16 },
  linkBtn: { alignItems: "center", paddingVertical: 8 },
  linkText: { color: "#ff6a00", fontWeight: "700", fontSize: 14 },
});

export default LoginScreen;
