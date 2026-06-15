import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { io, type Socket } from "socket.io-client";
import { nestEndpoints, type OrderItem } from "../../api/nestApi";
import { useAuth } from "../../auth/AuthContext";
import { NEST_API } from "../../config/env";

const ActiveDeliveryScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params as { orderId: string };
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      try { setOrder(await nestEndpoints.orderById(orderId)); } catch {}
    })();
  }, [orderId]);

  // Iniciar tracking GPS y enviar al backend cada 5s.
  useEffect(() => {
    let watcher: Location.LocationSubscription | null = null;
    const s = io(`${NEST_API}/tracking`, { transports: ["websocket"] });
    socketRef.current = s;

    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) { Alert.alert("Permiso GPS", "Necesitamos tu ubicación para el tracking"); return; }
      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 10, timeInterval: 5000 },
        (loc) => {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          setMyPos({ lat, lng });
          s.emit("courier-position", { orderId, lat, lng });
        },
      );
    })();

    return () => { if (watcher) watcher.remove(); s.disconnect(); };
  }, [orderId]);

  const confirm = async () => {
    if (!user || !order) return;
    if (code.length !== 4) { Alert.alert("Código inválido", "Debe tener 4 dígitos"); return; }
    setConfirming(true);
    try {
      await nestEndpoints.confirmDelivery(order._id, code, user.id);
      Alert.alert("✅ Entrega confirmada", "¡Buen trabajo!", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (e: any) {
      Alert.alert("Código incorrecto", e?.response?.data?.message ?? "Pedile el código correcto al cliente");
    } finally { setConfirming(false); }
  };

  if (!order) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  const lat = order.delivery_lat ?? myPos?.lat ?? 1.1481;
  const lng = order.delivery_lng ?? myPos?.lng ?? -76.6475;

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} title="Dirección de entrega" pinColor="#ff6a00" />
        {myPos && <Marker coordinate={{ latitude: myPos.lat, longitude: myPos.lng }} title="Tú" pinColor="#22c55e" />}
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.id}>Pedido #{order._id.slice(-6).toUpperCase()}</Text>
        {order.delivery_address && <Text style={styles.addr}>📍 {order.delivery_address}</Text>}

        <Text style={styles.codeLabel}>Pedile al cliente el código de 4 dígitos:</Text>
        <TextInput
          style={styles.codeInput}
          keyboardType="number-pad"
          maxLength={4}
          value={code}
          onChangeText={setCode}
          placeholder="• • • •"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={[styles.confirmBtn, confirming && { opacity: 0.7 }]} onPress={confirm} disabled={confirming}>
          {confirming ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirmar entrega</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  panel: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 18, borderTopRightRadius: 18, elevation: 12 },
  id: { fontWeight: "800", color: "#1a1a1a", fontSize: 16 },
  addr: { color: "#666", marginTop: 4, fontSize: 13 },
  codeLabel: { color: "#555", fontWeight: "700", marginTop: 14, marginBottom: 6 },
  codeInput: { backgroundColor: "#fff1e0", borderRadius: 12, paddingVertical: 14, fontSize: 28, letterSpacing: 18, textAlign: "center", color: "#ff6a00", fontWeight: "800" },
  confirmBtn: { backgroundColor: "#22c55e", marginTop: 12, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  confirmText: { color: "#fff", fontWeight: "800" },
});

export default ActiveDeliveryScreen;
