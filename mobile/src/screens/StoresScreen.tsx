import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { nestEndpoints, type VendorListItem } from "../api/nestApi";
import { intelligenceEndpoints } from "../api/intelligenceApi";

interface Props {
  navigation: any;
}

interface StoreWithEstimate extends VendorListItem {
  estimatedMinutes?: number;
}

const StoresScreen: React.FC<Props> = ({ navigation }) => {
  const [stores, setStores] = useState<StoreWithEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      // 1) Lista de tiendas — backend 1 (NestJS)
      const vendors = await nestEndpoints.listVendors();

      // 2) Para cada tienda, estimar el tiempo de entrega — backend 2 (FastAPI).
      //    Se hace EN PARALELO para no bloquear la UI.
      const enriched = await Promise.all(
        vendors.map(async (v) => {
          try {
            const est = await intelligenceEndpoints.estimateDelivery({
              distance_km: 3, // demo: distancia fija de prueba
              hour: new Date().getHours(),
            });
            return { ...v, estimatedMinutes: est.estimated_minutes };
          } catch {
            return { ...v };
          }
        }),
      );
      setStores(enriched);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff6a00" />
        <Text style={styles.loadingText}>Cargando tiendas...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stores}
      keyExtractor={(item) => String(item.vendor_id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Tiendas disponibles</Text>
          <Text style={styles.subtitle}>Datos del negocio (NestJS) + tiempo estimado por IA (FastAPI)</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.empty}>No hay tiendas disponibles</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("StoreDetail", { store: item })}
        >
          {item.storefront_image_url || item.logo_url ? (
            <Image
              source={{ uri: item.storefront_image_url ?? item.logo_url ?? "" }}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={styles.imagePlaceholderText}>🍽️</Text>
            </View>
          )}
          <View style={styles.cardBody}>
            <Text style={styles.cardName} numberOfLines={1}>{item.business_name}</Text>
            {item.business_type && <Text style={styles.cardType}>{item.business_type}</Text>}
            <View style={styles.cardMeta}>
              <View style={styles.metaPill}>
                <Text style={styles.metaIcon}>⏱️</Text>
                <Text style={styles.metaText}>
                  {item.estimatedMinutes != null
                    ? `~${item.estimatedMinutes} min`
                    : item.delivery_time ?? "—"}
                </Text>
              </View>
              {item.rating != null && (
                <View style={styles.metaPill}>
                  <Text style={styles.metaIcon}>⭐</Text>
                  <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#888" },
  list: { padding: 16 },
  header: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 12, color: "#777", marginTop: 2 },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: { backgroundColor: "#fff", borderRadius: 14, marginBottom: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  image: { width: "100%", height: 140, backgroundColor: "#f0f0f0" },
  imagePlaceholder: { justifyContent: "center", alignItems: "center" },
  imagePlaceholderText: { fontSize: 40 },
  cardBody: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  cardType: { fontSize: 12, color: "#999", marginTop: 2 },
  cardMeta: { flexDirection: "row", gap: 8, marginTop: 10 },
  metaPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff1e0", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, gap: 4 },
  metaIcon: { fontSize: 12 },
  metaText: { fontSize: 12, fontWeight: "700", color: "#ff6a00" },
});

export default StoresScreen;
