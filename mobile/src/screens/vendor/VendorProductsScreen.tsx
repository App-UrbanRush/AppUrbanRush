import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { nestEndpoints, type ProductListItem } from "../../api/nestApi";
import { useAuth } from "../../auth/AuthContext";

const VendorProductsScreen = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", image_url: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try { setProducts(await nestEndpoints.listProductsByVendor(user.id)); }
    catch {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", category: "", image_url: "" });
    setModal(true);
  };

  const openEdit = (p: ProductListItem) => {
    setEditingId(p.product_id);
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), category: p.category ?? "", image_url: p.image_url ?? "" });
    setModal(true);
  };

  const save = async () => {
    if (!user || !form.name || !form.price) { Alert.alert("Faltan datos", "Nombre y precio son obligatorios"); return; }
    const payload = {
      vendor_id: user.id,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      image_url: form.image_url || null,
      is_available: true,
    } as any;
    try {
      if (editingId) await nestEndpoints.updateProduct(editingId, payload);
      else           await nestEndpoints.createProduct(payload);
      setModal(false);
      load();
    } catch (e: any) { Alert.alert("Error", e?.response?.data?.message ?? "No se pudo guardar"); }
  };

  const remove = async (id: string) => {
    Alert.alert("¿Eliminar?", "El producto va a desaparecer del menú", [
      { text: "Cancelar" },
      { text: "Eliminar", style: "destructive", onPress: async () => {
        try { await nestEndpoints.deleteProduct(id); load(); }
        catch { Alert.alert("Error", "No se pudo eliminar"); }
      }},
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#ff6a00" size="large" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <View style={styles.head}>
        <Text style={styles.title}>Mis productos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openNew}>
          <Text style={styles.addText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(i) => i.product_id}
        contentContainerStyle={{ padding: 14 }}
        ListEmptyComponent={<Text style={styles.empty}>Aún no tenés productos publicados</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image_url
              ? <Image source={{ uri: item.image_url }} style={styles.img} />
              : <View style={[styles.img, styles.ph]}><Text>🍴</Text></View>}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>${item.price.toLocaleString("es-CO")}</Text>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Text style={styles.editText}>✏️ Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.product_id)}>
                  <Text style={styles.delText}>🗑️ Borrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>{editingId ? "Editar producto" : "Nuevo producto"}</Text>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput style={styles.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} />
          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, { minHeight: 70 }]} multiline value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} />
          <Text style={styles.label}>Precio *</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" value={form.price} onChangeText={(v) => setForm({ ...form, price: v })} />
          <Text style={styles.label}>Categoría</Text>
          <TextInput style={styles.input} value={form.category} onChangeText={(v) => setForm({ ...form, category: v })} />
          <Text style={styles.label}>URL de imagen</Text>
          <TextInput style={styles.input} value={form.image_url} onChangeText={(v) => setForm({ ...form, image_url: v })} placeholder="https://..." />

          <View style={{ flexDirection: "row", gap: 8, marginTop: 18 }}>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#eee" }]} onPress={() => setModal(false)}>
              <Text style={[styles.modalBtnText, { color: "#555" }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtn} onPress={save}>
              <Text style={styles.modalBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  head: { backgroundColor: "#ff6a00", padding: 20, paddingTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontWeight: "800", fontSize: 22 },
  addBtn: { backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addText: { color: "#fff", fontWeight: "800" },
  empty: { color: "#888", textAlign: "center", marginTop: 40 },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 10, borderRadius: 12, marginBottom: 10, gap: 10, alignItems: "center" },
  img: { width: 60, height: 60, borderRadius: 10, backgroundColor: "#f0f0f0" },
  ph: { justifyContent: "center", alignItems: "center" },
  name: { fontWeight: "700", color: "#1a1a1a" },
  price: { color: "#ff6a00", fontWeight: "800", marginTop: 2 },
  editText: { color: "#3b82f6", fontWeight: "700" },
  delText: { color: "#ef4444", fontWeight: "700" },
  modal: { padding: 20, paddingTop: 50, backgroundColor: "#fff" },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginBottom: 14 },
  label: { fontSize: 12, fontWeight: "600", color: "#444", marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  modalBtn: { flex: 1, backgroundColor: "#ff6a00", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "800" },
});

export default VendorProductsScreen;
