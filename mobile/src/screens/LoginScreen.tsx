import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../auth/AuthContext";

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Faltan datos", "Ingresá tu correo y contraseña");
      return;
    }
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      const status = e?.response?.status;
      Alert.alert(
        "No se pudo iniciar sesión",
        status === 401 || status === 400
          ? "Correo o contraseña incorrectos"
          : "No se pudo conectar con el servidor. Verificá que el backend esté corriendo.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.brand}>
        <Text style={styles.brandIcon}>🛵</Text>
        <Text style={styles.brandName}>UrbanRush</Text>
        <Text style={styles.brandTagline}>Entrega rápida a tu puerta</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Iniciar sesión</Text>

        <Text style={styles.label}>Correo electrónico</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="ej. usuario@correo.com"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={onSubmit}
          disabled={busy}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Para registrarte como cliente, negocio o domiciliario usá la versión web por ahora.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ff6a00", justifyContent: "center", padding: 20 },
  brand: { alignItems: "center", marginBottom: 30 },
  brandIcon: { fontSize: 56 },
  brandName: { color: "#fff", fontSize: 36, fontWeight: "800", letterSpacing: 1 },
  brandTagline: { color: "#fff", opacity: 0.9, fontSize: 14, marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 22, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a", marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#444", marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#222" },
  button: { marginTop: 22, backgroundColor: "#ff6a00", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  hint: { marginTop: 14, fontSize: 12, color: "#888", textAlign: "center" },
});

export default LoginScreen;
