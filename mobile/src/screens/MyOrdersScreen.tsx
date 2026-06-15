import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { nestEndpoints, type OrderItem } from "../api/nestApi";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "⏳ Pendiente",        color: "#f59e0b" },
  ACCEPTED:    { label: "✅ Aceptado",         color: "#22c55e" },
  PREPARING:   { label: "👨‍🍳 En preparación", color: "#3b82f6" },
  READY:       { label: "📦 Listo",            color: "#10b981" },
  IN_DELIVERY: { label: "🛵 En camino",        color: "#a855f7" },
  DELIVERED:   { label: "🎉 Entregado",        color: "#16a34a" },
  CANCELLED:   { label: "❌ Cancelado",         color: "#ef4444" },
};

const MyOrdersScreen = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await nestEndpoints.myOrders(user.id);
      setOrders(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch {
      // empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mis pedidos</Text>
            <Text style={styles.subtitle}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logout} onPress={logout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Aún no tenés pedidos</Text>
          <Text style={styles.emptyHint}>Cuando hagas tu primer pedido, va a aparecer acá.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const status = STATUS_LABEL[item.status] ?? { label: item.status, color: "#888" };
        return (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.orderId}>#{item._id.slice(-6).toUpperCase()}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${status.color}20` }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </Text>
            <View style={styles.orderTotal}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${item.total.toLocaleString("es-CO")}</Text>
            </View>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  list: { padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 12, color: "#888", marginTop: 2 },
  logout: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: "#fff1e0" },
  logoutText: { color: "#ff6a00", fontWeight: "700", fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#555" },
  emptyHint: { fontSize: 13, color: "#888", marginTop: 4, textAlign: "center", paddingHorizontal: 30 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  orderId: { fontSize: 14, fontWeight: "800", color: "#1a1a1a" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "700" },
  orderDate: { fontSize: 12, color: "#999" },
  orderTotal: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  totalLabel: { fontSize: 13, color: "#666" },
  totalAmount: { fontSize: 17, fontWeight: "800", color: "#ff6a00" },
});

export default MyOrdersScreen;
