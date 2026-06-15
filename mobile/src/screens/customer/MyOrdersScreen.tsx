import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { nestEndpoints, type OrderItem } from "../../api/nestApi";
import GuestPrompt from "../../components/GuestPrompt";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "⏳ Pendiente",        color: "#f59e0b" },
  ACCEPTED:    { label: "✅ Aceptado",         color: "#22c55e" },
  PREPARING:   { label: "👨‍🍳 Preparando",     color: "#3b82f6" },
  READY:       { label: "📦 Listo",            color: "#10b981" },
  IN_DELIVERY: { label: "🛵 En camino",        color: "#a855f7" },
  DELIVERED:   { label: "🎉 Entregado",        color: "#16a34a" },
  CANCELLED:   { label: "❌ Cancelado",         color: "#ef4444" },
};

const MyOrdersScreen = ({ navigation }: any) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  if (!token) {
    return (
      <GuestPrompt
        icon="📦"
        title="Tus pedidos en un solo lugar"
        message="Iniciá sesión para ver el estado de tus pedidos y darles seguimiento en el mapa."
        onLogin={() => navigation.getParent()?.getParent()?.navigate("Auth")}
      />
    );
  }

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await nestEndpoints.myOrders(user.id);
      setOrders(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch {} finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Aún no tenés pedidos</Text>
        </View>
      }
      renderItem={({ item }) => {
        const st = STATUS_LABEL[item.status] ?? { label: item.status, color: "#888" };
        const isLive = ["ACCEPTED", "PREPARING", "READY", "IN_DELIVERY"].includes(item.status);
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => isLive && navigation.navigate("Tracking", { orderId: item._id })}
          >
            <View style={styles.cardHead}>
              <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.pill, { backgroundColor: `${st.color}20` }]}>
                <Text style={[styles.pillText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</Text>
            {item.delivery_code && ["ACCEPTED", "PREPARING", "READY", "IN_DELIVERY"].includes(item.status) && (
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>Tu código de entrega</Text>
                <Text style={styles.codeNum}>{item.delivery_code}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${item.total.toLocaleString("es-CO")}</Text>
            </View>
            {isLive && <Text style={styles.cta}>Tocá para ver en el mapa →</Text>}
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 14 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 50 },
  emptyText: { color: "#888", marginTop: 10 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  orderId: { fontWeight: "800", color: "#1a1a1a" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 12, color: "#888" },
  codeBox: { backgroundColor: "#fff1e0", padding: 10, borderRadius: 10, alignItems: "center", marginTop: 10 },
  codeLabel: { fontSize: 11, color: "#666", fontWeight: "700" },
  codeNum: { fontSize: 24, fontWeight: "800", letterSpacing: 6, color: "#ff6a00", marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalLabel: { color: "#666" },
  totalAmount: { fontWeight: "800", color: "#ff6a00", fontSize: 16 },
  cta: { textAlign: "center", color: "#ff6a00", marginTop: 8, fontWeight: "700", fontSize: 12 },
});

export default MyOrdersScreen;
