import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../auth/AuthContext";
import { nestEndpoints } from "../../api/nestApi";
import GuestPrompt from "../../components/GuestPrompt";

const ProfileScreen = ({ navigation }: any) => {
  const { user, profile, refreshProfile, logout, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: profile?.firstName ?? "",
    firstLastName: profile?.firstLastName ?? "",
    cellphone: profile?.cellphone ?? "",
    address: profile?.address ?? "",
    gender: profile?.gender ?? "M",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!token) {
    return (
      <GuestPrompt
        icon="👤"
        title="Acceder a mi perfil"
        message="Iniciá sesión para ver tu información, foto, favoritos y configuraciones."
        onLogin={() => navigation.getParent()?.getParent()?.navigate("Auth")}
      />
    );
  }

  const openEdit = () => {
    setForm({
      firstName: profile?.firstName ?? "",
      firstLastName: profile?.firstLastName ?? "",
      cellphone: profile?.cellphone ?? "",
      address: profile?.address ?? "",
      gender: profile?.gender ?? "M",
    });
    setEditing(true);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await nestEndpoints.updateMyProfile(user.id, form);
      await refreshProfile();
      Alert.alert("Listo", "Perfil actualizado");
      setEditing(false);
    } catch { Alert.alert("Error", "No se pudo actualizar"); }
    finally { setSaving(false); }
  };

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permiso requerido", "Necesitamos acceso a tu galería"); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try {
      await nestEndpoints.uploadAvatar(res.assets[0].uri, "image/jpeg");
      await refreshProfile();
    } catch { Alert.alert("Error", "No se pudo subir la foto"); }
    finally { setUploading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.banner}>
        <TouchableOpacity onPress={pickPhoto} disabled={uploading}>
          <View style={styles.avatar}>
            {profile?.avatarUrl
              ? <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} />
              : <Text style={styles.avatarFallback}>👤</Text>}
            {uploading && <View style={styles.avatarOverlay}><ActivityIndicator color="#fff" /></View>}
          </View>
          <Text style={styles.changePhoto}>📷 Cambiar foto</Text>
        </TouchableOpacity>
        <Text style={styles.name}>{profile ? `${profile.firstName} ${profile.firstLastName}` : "Usuario"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.rolePill}><Text style={styles.roleText}>{user?.role}</Text></View>
      </View>

      {!editing ? (
        <View style={styles.card}>
          <Field label="📞 Celular" value={profile?.cellphone || "—"} />
          <Field label="📍 Dirección" value={profile?.address || "—"} />
          <Field label="⚧ Género" value={profile?.gender === "M" ? "Masculino" : profile?.gender === "F" ? "Femenino" : profile?.gender || "—"} />
          <TouchableOpacity style={styles.editBtn} onPress={openEdit}>
            <Text style={styles.editBtnText}>✏️ Editar perfil</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={form.firstName} onChangeText={(v) => setForm({ ...form, firstName: v })} />
          <Text style={styles.label}>Apellido</Text>
          <TextInput style={styles.input} value={form.firstLastName} onChangeText={(v) => setForm({ ...form, firstLastName: v })} />
          <Text style={styles.label}>Celular</Text>
          <TextInput style={styles.input} keyboardType="phone-pad" value={form.cellphone} onChangeText={(v) => setForm({ ...form, cellphone: v })} />
          <Text style={styles.label}>Dirección</Text>
          <TextInput style={styles.input} value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <TouchableOpacity style={[styles.editBtn, { flex: 1, backgroundColor: "#eee" }]} onPress={() => setEditing(false)}>
              <Text style={[styles.editBtnText, { color: "#555" }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editBtn, { flex: 1 }]} onPress={save} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.editBtnText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { backgroundColor: "#f7f7f8", paddingBottom: 40 },
  banner: { backgroundColor: "#ff6a00", padding: 20, alignItems: "center", paddingTop: 30, paddingBottom: 26 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImg: { width: 92, height: 92 },
  avatarFallback: { fontSize: 44 },
  avatarOverlay: { position: "absolute", inset: 0 as any, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", width: 92, height: 92, borderRadius: 46 },
  changePhoto: { color: "#fff", fontSize: 12, marginTop: 8, textAlign: "center", fontWeight: "700" },
  name: { color: "#fff", fontWeight: "800", fontSize: 20, marginTop: 10 },
  email: { color: "#fff", opacity: 0.9, fontSize: 13, marginTop: 2 },
  rolePill: { marginTop: 10, backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 999 },
  roleText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  card: { backgroundColor: "#fff", margin: 14, borderRadius: 14, padding: 16, elevation: 2 },
  field: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f3f3" },
  fieldLabel: { color: "#888", fontSize: 12, marginBottom: 3 },
  fieldValue: { color: "#222", fontWeight: "600", fontSize: 14 },
  label: { fontSize: 12, fontWeight: "600", color: "#444", marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#222" },
  editBtn: { marginTop: 12, backgroundColor: "#ff6a00", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  editBtnText: { color: "#fff", fontWeight: "700" },
  logout: { margin: 14, padding: 14, backgroundColor: "#fff", borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#ff3d6e" },
  logoutText: { color: "#ff3d6e", fontWeight: "800" },
});

export default ProfileScreen;
