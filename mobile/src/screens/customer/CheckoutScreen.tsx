import React, { useState } from "react";
import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthContext";
import { nestEndpoints } from "../../api/nestApi";

type PayMethod = "card" | "cash";

const CheckoutScreen = ({ navigation }: any) => {
  const { user, profile } = useAuth();
  const { state, total, clear } = useCart();
  const [address, setAddress] = useState(profile?.address ?? "");
  const [phone, setPhone] = useState(profile?.cellphone ?? "");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<PayMethod>("card");
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = 5000;
  const finalTotal = total + deliveryFee;

  const submit = async () => {
    if (!user) return Alert.alert("Inicia sesión", "Necesitás estar logueado");
    if (!address.trim()) return Alert.alert("Falta dirección", "Ingresá la dirección de entrega");
    if (state.items.length === 0) return;

    setSubmitting(true);
    try {
      // El DTO del backend solo acepta: user_id, vendor_id, delivery_address,
      // items:[{product_id, quantity}], customer_lat?, customer_lng?
      const order = await nestEndpoints.createOrder({
        user_id: Number(user.id),
        vendor_id: state.vendorId,
        delivery_address: address,
        items: state.items.map((i) => ({
          product_id: i.product.product_id,
          quantity: i.quantity,
        })),
      });
      clear();
      Alert.alert("🎉 ¡Pedido creado!", `Tu código de entrega es ${order.delivery_code ?? "—"}.\nDáselo al domiciliario cuando llegue.`, [
        { text: "Ver mis pedidos", onPress: () => navigation.getParent()?.navigate("Orders") },
      ]);
    } catch (e: any) {
      Alert.alert("No se pudo crear el pedido", e?.response?.data?.message ?? "Intentá de nuevo");
    } finally { setSubmitting(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: "#f7f7f8" }}>
      {/* Resumen pedido */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Ionicons name="bag-outline" size={20} color="#ff6a00" />
          <Text style={styles.cardTitle}>Tu pedido</Text>
        </View>
        {state.items.map((i) => (
          <View key={i.product.product_id} style={styles.line}>
            <Text style={styles.lineName} numberOfLines={1}>{i.quantity}x {i.product.name}</Text>
            <Text style={styles.linePrice}>${(i.product.price * i.quantity).toLocaleString("es-CO")}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.line}><Text style={styles.lineName}>Subtotal</Text><Text style={styles.linePrice}>${total.toLocaleString("es-CO")}</Text></View>
        <View style={styles.line}><Text style={styles.lineName}>Envío</Text><Text style={styles.linePrice}>${deliveryFee.toLocaleString("es-CO")}</Text></View>
        <View style={[styles.line, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#f0f0f0" }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${finalTotal.toLocaleString("es-CO")}</Text>
        </View>
      </View>

      {/* Entrega */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Ionicons name="location-outline" size={20} color="#ff6a00" />
          <Text style={styles.cardTitle}>Entrega</Text>
        </View>
        <Text style={styles.label}>Dirección de entrega *</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Calle, número, barrio..." placeholderTextColor="#aaa" />
        <Text style={styles.label}>Celular de contacto</Text>
        <TextInput style={styles.input} keyboardType="phone-pad" value={phone} onChangeText={setPhone} placeholder="300 123 4567" placeholderTextColor="#aaa" />
        <Text style={styles.label}>Notas para el domiciliario (opcional)</Text>
        <TextInput style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]} multiline value={note} onChangeText={setNote} placeholder="Ej: Tocá el timbre, segundo piso..." placeholderTextColor="#aaa" />
      </View>

      {/* Pago */}
      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Ionicons name="card-outline" size={20} color="#ff6a00" />
          <Text style={styles.cardTitle}>Método de pago</Text>
        </View>
        <TouchableOpacity style={[styles.payOption, method === "card" && styles.payOptionActive]} onPress={() => setMethod("card")}>
          <Ionicons name="card" size={22} color={method === "card" ? "#ff6a00" : "#999"} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.payOptionTitle, method === "card" && { color: "#ff6a00" }]}>Tarjeta de crédito/débito</Text>
            <Text style={styles.payOptionDesc}>Pago seguro vía Wompi (simulado en demo)</Text>
          </View>
          <Ionicons name={method === "card" ? "radio-button-on" : "radio-button-off"} size={20} color={method === "card" ? "#ff6a00" : "#ccc"} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.payOption, method === "cash" && styles.payOptionActive]} onPress={() => setMethod("cash")}>
          <Ionicons name="cash" size={22} color={method === "cash" ? "#ff6a00" : "#999"} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.payOptionTitle, method === "cash" && { color: "#ff6a00" }]}>Efectivo</Text>
            <Text style={styles.payOptionDesc}>Pagás al domiciliario al recibir</Text>
          </View>
          <Ionicons name={method === "cash" ? "radio-button-on" : "radio-button-off"} size={20} color={method === "cash" ? "#ff6a00" : "#ccc"} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.confirmBtn, submitting && { opacity: 0.7 }]} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.confirmText}>Confirmar pedido</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.disclaimer}>Al confirmar aceptás los términos y condiciones. Los pagos en demo son simulados.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 14, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, elevation: 1 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: "900", color: "#1a1a1a" },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  lineName: { color: "#555", flex: 1, fontSize: 13 },
  linePrice: { color: "#222", fontWeight: "700", fontSize: 13 },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 8 },
  totalLabel: { fontWeight: "900", color: "#444", fontSize: 16 },
  totalAmount: { fontWeight: "900", color: "#ff6a00", fontSize: 18 },

  label: { fontSize: 12, fontWeight: "700", color: "#444", marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: "#222" },

  payOption: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#eee", padding: 12, borderRadius: 12, marginBottom: 8 },
  payOptionActive: { borderColor: "#ff6a00", backgroundColor: "#fff8f2" },
  payOptionTitle: { fontWeight: "800", color: "#222", fontSize: 14 },
  payOptionDesc: { color: "#888", fontSize: 11, marginTop: 2 },

  confirmBtn: { backgroundColor: "#ff6a00", paddingVertical: 16, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 6, elevation: 4, shadowColor: "#ff6a00", shadowOpacity: 0.4, shadowRadius: 10 },
  confirmText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  disclaimer: { color: "#999", fontSize: 11, textAlign: "center", marginTop: 12, paddingHorizontal: 10, lineHeight: 16 },
});

export default CheckoutScreen;
