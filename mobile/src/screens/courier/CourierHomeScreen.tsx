import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { nestEndpoints, type OrderItem } from "../../api/nestApi";

const CourierHomeScreen = ({ navigation }: any) => {
  const { user, profile, logout } = useAuth();
  const [available, setAvailable] = useState<OrderItem[]>([]);
  const [active, setActive] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [av, mine] = await Promise.all([
        nestEndpoints.availableOrders().catch(() => []),
        nestEndpoints.courierOrders(user.id).catch(() => []),
      ]);
      setAvailable(av);
      setActive(mine.find((o: OrderItem) => o.status === "IN_DELIVERY") ?? null);
    } finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const accept = async (orderId: string) => {
    if (!user) return;
    try {
      await nestEndpoints.acceptOrder(orderId, user.id);
      await load();
      navigation.navigate("ActiveDelivery", { orderId });
    } catch (e: any) {
      alert(e?.response?.data?.message ?? "No se pudo aceptar");
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f7f8" }}>
      <View style={styles.greet}>
        <Text style={styles.greetTitle}>Hola{profile ? `, ${profile.firstName}` : ""} 🛵</Text>
        <Text style={styles.greetSub}>Pedidos disponibles para repartir</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {active && (
        <TouchableOpacity style={styles.activeBanner} onPress={() => navigation.navigate("ActiveDelivery", { orderId: active._id })}>
          <Text style={styles.activeIcon}>🛵</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.activeTitle}>Tenés una entrega en curso</Text>
            <Text style={styles.activeSub}>Pedido #{active._id.slice(-6).toUpperCase()} · tocá para continuar</Text>
          </View>
          <Text style={styles.activeArrow}>›</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={available}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⏸️</Text>
            <Text style={styles.emptyText}>No hay pedidos disponibles ahora</Text>
            <Text style={styles.emptyHint}>Mantenete atento, llegan en cualquier momento</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.id}>#{item._id.slice(-6).toUpperCase()}</Text>
              <Text style={styles.amount}>${item.total.toLocaleString("es-CO")}</Text>
            </View>
            {item.delivery_address && (
              <Text style={styles.addr}>📍 {item.delivery_address}</Text>
            )}
            <Text style={styles.itemsCount}>{item.items?.length ?? 0} productos</Text>
            <TouchableOpacity style={styles.acceptBtn} onPress={() => accept(item._id)} disabled={!!active}>
              <Text style={styles.acceptText}>{active ? "Tenés un pedido activo" : "Aceptar entrega"}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  greet: { padding: 20, paddingTop: 50, backgroundColor: "#ff6a00", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greetTitle: { color: "#fff", fontWeight: "800", fontSize: 20 },
  greetSub: { color: "#fff", opacity: 0.95, fontSize: 13, marginTop: 2 },
  logoutBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  activeBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#22c55e", padding: 14, gap: 10 },
  activeIcon: { fontSize: 26 },
  activeTitle: { color: "#fff", fontWeight: "800" },
  activeSub: { color: "#fff", fontSize: 12, opacity: 0.95, marginTop: 2 },
  activeArrow: { color: "#fff", fontSize: 28 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 50 },
  emptyText: { fontWeight: "700", color: "#555", marginTop: 10 },
  emptyHint: { color: "#888", fontSize: 12, marginTop: 4, textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardHead: { flexDirection: "row", justifyContent: "space-between" },
  id: { fontWeight: "800", color: "#1a1a1a" },
  amount: { fontWeight: "800", color: "#ff6a00", fontSize: 16 },
  addr: { fontSize: 13, color: "#666", marginTop: 6 },
  itemsCount: { fontSize: 12, color: "#888", marginTop: 4 },
  acceptBtn: { backgroundColor: "#ff6a00", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 10 },
  acceptText: { color: "#fff", fontWeight: "800" },
});

export default CourierHomeScreen;
