import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";

const RegisterCustomerScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [form, setForm] = useState({
    user_email: "",
    user_password: "",
    firstName: "",
    firstLastName: "",
    cellphone: "",
    address: "",
    gender: "M",
  });
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async () => {
    if (!form.user_email || !form.user_password || !form.firstName) {
      Alert.alert("Faltan datos", "Completá nombre, correo y contraseña");
      return;
    }
    if (form.user_password.length < 6) {
      Alert.alert("Contraseña corta", "Mínimo 6 caracteres");
      return;
    }
    setBusy(true);
    try {
      await register(form);
      Alert.alert("¡Bienvenido!", "Tu cuenta fue creada correctamente");
    } catch (e: any) {
      Alert.alert("No se pudo registrar", e?.response?.data?.message ?? "Error desconocido");
    } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registro de cliente</Text>
        <Text style={styles.subtitle}>Ya casi terminamos — completá tus datos</Text>

        <Text style={styles.label}>Correo *</Text>
        <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address" value={form.user_email} onChangeText={(v) => set("user_email", v)} />

        <Text style={styles.label}>Contraseña *</Text>
        <TextInput style={styles.input} secureTextEntry value={form.user_password} onChangeText={(v) => set("user_password", v)} />

        <Text style={styles.label}>Nombre *</Text>
        <TextInput style={styles.input} value={form.firstName} onChangeText={(v) => set("firstName", v)} />

        <Text style={styles.label}>Apellido</Text>
        <TextInput style={styles.input} value={form.firstLastName} onChangeText={(v) => set("firstLastName", v)} />

        <Text style={styles.label}>Celular</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" value={form.cellphone} onChangeText={(v) => set("cellphone", v)} />

        <Text style={styles.label}>Dirección</Text>
        <TextInput style={styles.input} value={form.address} onChangeText={(v) => set("address", v)} />

        <Text style={styles.label}>Género</Text>
        <View style={styles.genderRow}>
          {["M", "F", "Otro"].map((g) => (
            <TouchableOpacity key={g} style={[styles.genderChip, form.gender === g && styles.genderChipActive]} onPress={() => set("gender", g)}>
              <Text style={[styles.genderText, form.gender === g && { color: "#fff" }]}>{g === "M" ? "Masculino" : g === "F" ? "Femenino" : "Otro"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.btn, busy && { opacity: 0.7 }]} onPress={onSubmit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Crear cuenta</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={{ alignItems: "center", marginTop: 10 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: "#ff6a00", fontWeight: "700" }}>← Volver</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#777", marginTop: 4, marginBottom: 18 },
  label: { fontSize: 12, fontWeight: "600", color: "#444", marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#222" },
  genderRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  genderChip: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: "#f6f6f8" },
  genderChipActive: { backgroundColor: "#ff6a00" },
  genderText: { fontWeight: "700", color: "#555" },
  btn: { marginTop: 24, backgroundColor: "#ff6a00", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

export default RegisterCustomerScreen;
