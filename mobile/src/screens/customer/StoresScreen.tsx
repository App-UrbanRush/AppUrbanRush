import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { nestEndpoints, type VendorListItem } from "../../api/nestApi";
import { intelligenceEndpoints } from "../../api/intelligenceApi";
import StoreCard from "../../components/StoreCard";

type StoreWith = VendorListItem & { estimatedMinutes?: number };

const StoresScreen = ({ navigation }: any) => {
  const [stores, setStores] = useState<StoreWith[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [searchIds, setSearchIds] = useState<Set<number> | null>(null);

  const load = useCallback(async () => {
    try {
      const vendors = await nestEndpoints.listVendors();
      const enriched = await Promise.all(vendors.map(async (v) => {
        try {
          const est = await intelligenceEndpoints.estimateDelivery({ distance_km: 3, hour: new Date().getHours() });
          return { ...v, estimatedMinutes: est.estimated_minutes };
        } catch { return v; }
      }));
      setStores(enriched);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const query = q.trim();
    if (!query) { setSearchIds(null); return; }
    const t = setTimeout(async () => {
      try {
        const results = await nestEndpoints.search(query, 50);
        const ids = new Set<number>();
        results.forEach((r) => {
          if (r.type === "VENDOR" && typeof r.id === "number") ids.add(r.id);
          if (r.type === "PRODUCT" && typeof r.vendorId === "number") ids.add(r.vendorId);
        });
        setSearchIds(ids);
      } catch { setSearchIds(null); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return stores;
    if (searchIds && searchIds.size > 0) return stores.filter((s) => searchIds.has(s.vendor_id));
    return stores.filter((s) => s.business_name.toLowerCase().includes(query));
  }, [stores, q, searchIds]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => String(item.vendor_id)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />}
      ListHeaderComponent={
        <View>
          {/* Banner naranja con buscador, estilo web */}
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Tiendas en UrbanRush</Text>
            <Text style={styles.bannerSubtitle}>Descubrí los mejores restaurantes y tiendas cerca de ti</Text>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="#ff6a00" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.search}
                placeholder="Buscar tienda o producto..."
                placeholderTextColor="#999"
                value={q}
                onChangeText={setQ}
              />
            </View>
          </View>

          <View style={styles.resultsHeader}>
            <Text style={styles.resultsCount}>
              {filtered.length} {filtered.length === 1 ? "tienda" : "tiendas"}{q ? ` para "${q}"` : ""}
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading
          ? <ActivityIndicator size="large" color="#ff6a00" style={{ marginTop: 40 }} />
          : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>No encontramos tiendas</Text>
              <Text style={styles.emptyHint}>Probá con otro nombre o categoría</Text>
            </View>
          )
      }
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 14 }}>
          <StoreCard store={item} onPress={() => navigation.navigate("StoreDetail", { store: item })} />
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: 20 },
  banner: { backgroundColor: "#ff6a00", padding: 22, paddingBottom: 30 },
  bannerTitle: { color: "#fff", fontSize: 24, fontWeight: "900" },
  bannerSubtitle: { color: "#fff", opacity: 0.95, fontSize: 13, marginTop: 4, fontWeight: "600" },
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, marginTop: 16, elevation: 4, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8 },
  search: { flex: 1, paddingVertical: 14, color: "#222", fontSize: 14, fontWeight: "500" },
  resultsHeader: { padding: 14, paddingBottom: 6 },
  resultsCount: { color: "#777", fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { fontWeight: "800", color: "#555", fontSize: 16 },
  emptyHint: { color: "#888", fontSize: 12, marginTop: 4 },
});

export default StoresScreen;
