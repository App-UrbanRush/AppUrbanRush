import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { VendorListItem } from "../api/nestApi";
import { useFavorites } from "../context/FavoritesContext";

interface Props { store: VendorListItem & { estimatedMinutes?: number }; onPress: () => void; }

const StoreCard: React.FC<Props> = ({ store, onPress }) => {
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(store.vendor_id);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {store.storefront_image_url || store.logo_url ? (
        <Image source={{ uri: store.storefront_image_url ?? store.logo_url ?? "" }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.ph]}><Text style={styles.phIcon}>🍽️</Text></View>
      )}
      <TouchableOpacity style={styles.fav} onPress={() => toggle(store.vendor_id)}>
        <Text style={styles.favIcon}>{fav ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{store.business_name}</Text>
        {store.business_type && <Text style={styles.type}>{store.business_type}</Text>}
        <View style={styles.meta}>
          <View style={styles.pill}>
            <Text style={styles.pillIcon}>⏱️</Text>
            <Text style={styles.pillText}>
              {store.estimatedMinutes != null ? `~${store.estimatedMinutes} min` : store.delivery_time ?? "—"}
            </Text>
          </View>
          {store.rating != null && (
            <View style={styles.pill}>
              <Text style={styles.pillIcon}>⭐</Text>
              <Text style={styles.pillText}>{store.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 14, marginBottom: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  image: { width: "100%", height: 140, backgroundColor: "#f0f0f0" },
  ph: { justifyContent: "center", alignItems: "center" },
  phIcon: { fontSize: 40 },
  fav: { position: "absolute", top: 10, right: 10, backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 20, width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  favIcon: { fontSize: 18 },
  body: { padding: 14 },
  name: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  type: { fontSize: 12, color: "#999", marginTop: 2 },
  meta: { flexDirection: "row", gap: 8, marginTop: 10 },
  pill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff1e0", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, gap: 4 },
  pillIcon: { fontSize: 12 },
  pillText: { fontSize: 12, fontWeight: "700", color: "#ff6a00" },
});

export default StoreCard;
