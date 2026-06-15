import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { nestEndpoints, type VendorListItem } from "../../api/nestApi";
import { useFavorites } from "../../context/FavoritesContext";
import StoreCard from "../../components/StoreCard";

const FavoritesScreen = ({ navigation }: any) => {
  const { ids } = useFavorites();
  const [stores, setStores] = useState<VendorListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await nestEndpoints.listVendors();
        setStores(all.filter((s) => ids.includes(s.vendor_id)));
      } finally { setLoading(false); }
    })();
  }, [ids]);

  if (loading) return <View style={styles.center}><ActivityIndicator color="#ff6a00" size="large" /></View>;

  return (
    <FlatList
      data={stores}
      keyExtractor={(item) => String(item.vendor_id)}
      contentContainerStyle={{ padding: 14 }}
      ListHeaderComponent={<Text style={styles.title}>Mis favoritos</Text>}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={styles.emptyText}>Aún no marcaste favoritos</Text>
          <Text style={styles.emptyHint}>Tocá el corazón en una tienda para guardarla</Text>
        </View>
      }
      renderItem={({ item }) => (
        <StoreCard store={item} onPress={() => navigation.navigate("StoreDetail", { store: item })} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginBottom: 14 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 50 },
  emptyText: { fontWeight: "700", color: "#555", marginTop: 10 },
  emptyHint: { color: "#888", fontSize: 12, marginTop: 4, textAlign: "center", paddingHorizontal: 20 },
});

export default FavoritesScreen;
