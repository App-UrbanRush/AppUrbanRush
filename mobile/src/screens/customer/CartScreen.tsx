import React from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../auth/AuthContext";

const CartScreen = ({ navigation }: any) => {
  const { state, total, updateQty, removeItem, clear } = useCart();
  const { token } = useAuth();

  const goToCheckout = () => {
    if (!token) {
      Alert.alert(
        "Iniciá sesión para pagar",
        "Necesitás una cuenta para confirmar tu pedido.",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Iniciar sesión", onPress: () => navigation.getParent()?.getParent()?.navigate("Auth") },
        ],
      );
      return;
    }
    navigation.navigate("Checkout");
  };

  if (state.items.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconWrap}>
          <Ionicons name="cart-outline" size={64} color="#ff6a00" />
        </View>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyHint}>Agregá productos desde una tienda para empezar tu pedido</Text>
        <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.getParent()?.navigate("Stores")}>
          <Text style={styles.exploreText}>Explorar tiendas</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deliveryFee = 5000;
  const finalTotal = total + deliveryFee;

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <FlatList
        data={state.items}
        keyExtractor={(item) => item.product.product_id}
        contentContainerStyle={{ padding: 14, paddingBottom: 20 }}
        ListHeaderComponent={
          <View style={styles.vendorBanner}>
            <View style={styles.vendorIcon}>
              <Ionicons name="storefront" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.vendorLabel}>Pediste de</Text>
              <Text style={styles.vendorName} numberOfLines={1}>{state.vendorName}</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert("¿Vaciar carrito?", "Vas a quitar todos los productos", [
                { text: "Cancelar" }, { text: "Vaciar", style: "destructive", onPress: clear }
              ])}
              style={styles.clearBtn}
            >
              <Ionicons name="trash-outline" size={18} color="#ff3d6e" />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            {item.product.image_url
              ? <Image source={{ uri: item.product.image_url }} style={styles.img} />
              : <View style={[styles.img, styles.ph]}><Text style={{ fontSize: 22 }}>🍴</Text></View>}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
              <Text style={styles.price}>${item.product.price.toLocaleString("es-CO")}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.product_id, item.quantity - 1)}>
                  <Ionicons name="remove" size={16} color="#ff6a00" />
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.product.product_id, item.quantity + 1)}>
                  <Ionicons name="add" size={16} color="#ff6a00" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(item.product.product_id)}>
              <Ionicons name="close" size={18} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Resumen</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>${total.toLocaleString("es-CO")}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Envío</Text><Text style={styles.summaryValue}>${deliveryFee.toLocaleString("es-CO")}</Text></View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${finalTotal.toLocaleString("es-CO")}</Text>
            </View>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={goToCheckout}>
          <Text style={styles.payText}>Pagar ahora · ${finalTotal.toLocaleString("es-CO")}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, backgroundColor: "#f7f7f8" },
  emptyIconWrap: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#fff1e0", justifyContent: "center", alignItems: "center", marginBottom: 18 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: "#1a1a1a" },
  emptyHint: { fontSize: 13, color: "#888", marginTop: 6, textAlign: "center", paddingHorizontal: 20, lineHeight: 19 },
  exploreBtn: { marginTop: 24, backgroundColor: "#ff6a00", paddingVertical: 14, paddingHorizontal: 36, borderRadius: 999, elevation: 4, shadowColor: "#ff6a00", shadowOpacity: 0.4, shadowRadius: 8 },
  exploreText: { color: "#fff", fontWeight: "800", fontSize: 14 },

  vendorBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 14, gap: 12, elevation: 1 },
  vendorIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ff6a00", justifyContent: "center", alignItems: "center" },
  vendorLabel: { color: "#888", fontSize: 11, fontWeight: "600" },
  vendorName: { fontWeight: "800", color: "#1a1a1a", fontSize: 14 },
  clearBtn: { padding: 6 },

  item: { flexDirection: "row", backgroundColor: "#fff", padding: 12, borderRadius: 14, gap: 12, marginBottom: 10, alignItems: "center", elevation: 1 },
  img: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#f0f0f0" },
  ph: { justifyContent: "center", alignItems: "center" },
  name: { fontWeight: "800", color: "#1a1a1a", fontSize: 14 },
  price: { color: "#ff6a00", fontWeight: "900", marginTop: 2, fontSize: 13 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff1e0", justifyContent: "center", alignItems: "center" },
  qtyNum: { minWidth: 24, textAlign: "center", fontWeight: "900", color: "#222", fontSize: 14 },
  removeBtn: { padding: 6 },

  summary: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginTop: 8 },
  summaryTitle: { fontSize: 14, fontWeight: "800", color: "#444", marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  summaryLabel: { color: "#666", fontSize: 13 },
  summaryValue: { color: "#222", fontWeight: "700", fontSize: 13 },
  summaryTotal: { marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalLabel: { fontWeight: "900", color: "#444", fontSize: 15 },
  totalAmount: { fontWeight: "900", color: "#ff6a00", fontSize: 19 },

  footer: { backgroundColor: "#fff", padding: 14, borderTopWidth: 1, borderTopColor: "#eee" },
  payBtn: { backgroundColor: "#ff6a00", paddingVertical: 15, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, elevation: 4, shadowColor: "#ff6a00", shadowOpacity: 0.4, shadowRadius: 8 },
  payText: { color: "#fff", fontWeight: "900", fontSize: 15 },
});

export default CartScreen;
