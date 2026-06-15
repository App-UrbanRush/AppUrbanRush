import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { nestEndpoints, type OrderItem } from "../../api/nestApi";
import { useAuth } from "../../auth/AuthContext";

const NEXT: Record<string, string> = {
  PENDING: "ACCEPTED",
  ACCEPTED: "PREPARING",
  PREPARING: "READY",
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "⏳ Pendiente",  color: "#f59e0b" },
  ACCEPTED:    { label: "✅ Aceptado",    color: "#22c55e" },
  PREPARING:   { label: "👨‍🍳 Preparando", color: "#3b82f6" },
  READY:       { label: "📦 Listo",       color: "#10b981" },
  IN_DELIVERY: { label: "🛵 En camino",   color: "#a855f7" },
  DELIVERED:   { label: "🎉 Entregado",   color: "#16a34a" },
  CANCELLED:   { label: "❌ Cancelado",    color: "#ef4444" },
};

const VendorOrdersScreen = () => {
  const { profile, user, logout } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      // El vendor_id se obtiene del backend (a partir del user_id). Aquí simplificamos:
      // usamos el user.id y dejamos que el endpoint /orders/vendor/:id resuelva.
      const data = await nestEndpoints.vendorOrders(user.id);
      setOrders(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const advance = async (order: OrderItem) => {
    const next = NEXT[order.status];
    if (!next) return Alert.alert("Sin acción", "Este pedido ya no admite cambios desde acá.");
    try {
      await nestEndpoints.updateOrderStatus(order._id, next);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.message ?? "No se pudo cambiar el estado");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Pedidos</Text>
          <Text style={styles.sub}>{profile ? `${profile.firstName}` : "Mi negocio"}</Text>
        </View>
        <TouchableOpacity onPress={logout}><Text style={styles.logout}>Salir</Text></TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />}
        ListEmptyComponent={<Text style={styles.empty}>Sin pedidos por ahora</Text>}
        renderItem={({ item }) => {
          const st = STATUS_LABEL[item.status] ?? { label: item.status, color: "#888" };
          const canAdvance = !!NEXT[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.id}>#{item._id.slice(-6).toUpperCase()}</Text>
                <View style={[styles.pill, { backgroundColor: `${st.color}20` }]}>
                  <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
                </View>
              </View>
              <Text style={styles.amount}>${item.total.toLocaleString("es-CO")}</Text>
              <Text style={styles.items}>{item.items?.length ?? 0} productos</Text>
              {canAdvance && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => advance(item)}>
                  <Text style={styles.actionText}>Avanzar → {NEXT[item.status]}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  head: { backgroundColor: "#ff6a00", padding: 20, paddingTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontWeight: "800", fontSize: 22 },
  sub: { color: "#fff", opacity: 0.9, fontSize: 13, marginTop: 2 },
  logout: { color: "#fff", fontWeight: "700" },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  id: { fontWeight: "800", color: "#1a1a1a" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "700" },
  amount: { fontSize: 18, fontWeight: "800", color: "#ff6a00", marginTop: 6 },
  items: { color: "#888", fontSize: 12, marginTop: 2 },
  actionBtn: { marginTop: 12, backgroundColor: "#22c55e", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700" },
});

export default VendorOrdersScreen;
