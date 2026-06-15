import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { io, type Socket } from "socket.io-client";
import { nestEndpoints, type OrderItem } from "../../api/nestApi";
import { NEST_API } from "../../config/env";

const STATUS_LABEL: Record<string, string> = {
  PENDING:     "⏳ Pendiente de aceptar",
  ACCEPTED:    "✅ Aceptado por el negocio",
  PREPARING:   "👨‍🍳 En preparación",
  READY:       "📦 Listo, esperando domiciliario",
  IN_DELIVERY: "🛵 En camino contigo",
  DELIVERED:   "🎉 Entregado",
  CANCELLED:   "❌ Cancelado",
};

const TrackingScreen = ({ route }: any) => {
  const { orderId } = route.params as { orderId: string };
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [courierPos, setCourierPos] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      try { setOrder(await nestEndpoints.orderById(orderId)); }
      finally { setLoading(false); }
    })();
  }, [orderId]);

  useEffect(() => {
    const s = io(`${NEST_API}/tracking`, { transports: ["websocket"], reconnection: true });
    socketRef.current = s;
    s.on("connect", () => s.emit("subscribe-order", { orderId }));
    s.on("courier-position", (data: { lat: number; lng: number }) => setCourierPos(data));
    s.on("order-update", (updated: OrderItem) => setOrder((prev) => prev ? { ...prev, ...updated } : updated));
    return () => { s.disconnect(); socketRef.current = null; };
  }, [orderId]);

  if (loading || !order) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  const lat = order.delivery_lat ?? 1.1481;
  const lng = order.delivery_lng ?? -76.6475;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ flex: 1 }}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} title="Tu ubicación" pinColor="#ff6a00" />
        {courierPos && (
          <Marker coordinate={{ latitude: courierPos.lat, longitude: courierPos.lng }} title="Domiciliario" pinColor="#22c55e" />
        )}
      </MapView>
      <View style={styles.bottom}>
        <Text style={styles.id}>#{order._id.slice(-6).toUpperCase()}</Text>
        <Text style={styles.status}>{STATUS_LABEL[order.status] ?? order.status}</Text>
        {order.delivery_code && (
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Tu código de entrega</Text>
            <Text style={styles.codeNum}>{order.delivery_code}</Text>
            <Text style={styles.codeHint}>Dáselo al domiciliario cuando llegue</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  bottom: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, elevation: 12 },
  id: { fontWeight: "800", fontSize: 14, color: "#666" },
  status: { fontSize: 18, fontWeight: "800", color: "#1a1a1a", marginTop: 4 },
  codeBox: { marginTop: 12, backgroundColor: "#fff1e0", borderRadius: 12, alignItems: "center", padding: 14 },
  codeLabel: { fontSize: 11, color: "#666", fontWeight: "700" },
  codeNum: { fontSize: 32, fontWeight: "800", letterSpacing: 8, color: "#ff6a00", marginVertical: 6 },
  codeHint: { fontSize: 11, color: "#888" },
});

export default TrackingScreen;
