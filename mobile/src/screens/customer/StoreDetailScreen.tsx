import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { nestEndpoints, type ProductListItem, type VendorListItem } from "../../api/nestApi";
import { intelligenceEndpoints, type SentimentReport } from "../../api/intelligenceApi";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";

const { width } = Dimensions.get("window");

const StoreDetailScreen = ({ route, navigation }: any) => {
  const { store } = route.params as { store: VendorListItem };
  const { addItem } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(store.vendor_id);

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);

  // Fotos: usar las URLs reales del vendor; fallback a placeholders Unsplash
  const photos = [store.storefront_image_url, store.logo_url].filter(Boolean) as string[];
  if (photos.length === 0) photos.push("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=560&fit=crop&q=80");

  useEffect(() => {
    (async () => {
      const [prods, sent] = await Promise.all([
        nestEndpoints.listProductsByVendor(store.vendor_id).catch(() => [] as ProductListItem[]),
        intelligenceEndpoints.sentimentReport(store.vendor_id).catch(() => null),
      ]);
      setProducts(prods);
      setSentiment(sent);
      setLoading(false);
    })();
  }, [store.vendor_id]);

  // Auto-rotación del carrusel si hay más de 1 foto
  useEffect(() => {
    if (photos.length <= 1) return;
    const id = setInterval(() => setPhotoIdx((i) => (i + 1) % photos.length), 3500);
    return () => clearInterval(id);
  }, [photos.length]);

  const onAdd = (p: ProductListItem) => {
    addItem(p, { id: store.vendor_id, name: store.business_name });
    Alert.alert("✅ Agregado", `${p.name} se agregó al carrito`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f7f7f8" }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* ─── HERO con carrusel ─── */}
      <View style={styles.hero}>
        {photos.map((src, i) => (
          <ImageBackground
            key={src + i}
            source={{ uri: src }}
            style={[styles.heroImg, { opacity: i === photoIdx ? 1 : 0 }]}
            resizeMode="cover"
          />
        ))}
        <View style={styles.heroGradient} />

        {/* Botones flotantes */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favBtn} onPress={() => toggle(store.vendor_id)}>
          <Ionicons name={fav ? "heart" : "heart-outline"} size={22} color={fav ? "#ff3d6e" : "#fff"} />
        </TouchableOpacity>

        {/* Dots */}
        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View key={i} style={[styles.dot, i === photoIdx && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Badge rating arriba a la derecha */}
        {store.rating != null && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#ffb300" />
            <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {/* ─── Info principal ─── */}
      <View style={styles.infoCard}>
        <Text style={styles.storeName}>{store.business_name}</Text>
        {store.business_type && (
          <View style={styles.typeChip}>
            <Text style={styles.typeChipText}>{store.business_type}</Text>
          </View>
        )}
        {store.description && <Text style={styles.desc}>{store.description}</Text>}

        <View style={styles.metaRow}>
          {store.business_address && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#ff6a00" />
              <Text style={styles.metaText} numberOfLines={1}>{store.business_address}</Text>
            </View>
          )}
          {store.delivery_time && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#ff6a00" />
              <Text style={styles.metaText}>{store.delivery_time}</Text>
            </View>
          )}
        </View>
      </View>

      {/* ─── Tarjeta de sentimiento del FastAPI ─── */}
      <View style={styles.sentimentCard}>
        <Text style={styles.sentTitle}>📊 Reseñas analizadas con IA</Text>
        <Text style={styles.sentSubtitle}>Procesado por el módulo de inteligencia (FastAPI)</Text>
        {loading ? <ActivityIndicator color="#ff6a00" style={{ marginTop: 10 }} /> : sentiment ? (
          <View style={styles.sentRow}>
            <SentBox count={sentiment.positive} label="😊 Positivas" bg="#dcfce7" />
            <SentBox count={sentiment.neutral}  label="😐 Neutras"   bg="#fef9c3" />
            <SentBox count={sentiment.negative} label="😞 Negativas" bg="#fee2e2" />
          </View>
        ) : <Text style={styles.sentEmpty}>Aún sin reseñas analizadas</Text>}
      </View>

      {/* ─── Menú ─── */}
      <Text style={styles.menuTitle}>Menú</Text>
      {loading ? <ActivityIndicator color="#ff6a00" style={{ marginTop: 20 }} /> : products.length === 0 ? (
        <View style={styles.menuEmpty}>
          <Text style={styles.menuEmptyIcon}>🍴</Text>
          <Text style={styles.menuEmptyText}>Aún no hay productos publicados</Text>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 14 }}>
          {products.map((p) => (
            <View key={p.product_id} style={styles.product}>
              {p.image_url
                ? <Image source={{ uri: p.image_url }} style={styles.productImg} />
                : <View style={[styles.productImg, styles.productPh]}><Text style={{ fontSize: 24 }}>🍴</Text></View>
              }
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                {p.description && <Text style={styles.productDesc} numberOfLines={2}>{p.description}</Text>}
                <Text style={styles.productPrice}>${p.price.toLocaleString("es-CO")}</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(p)}>
                <Ionicons name="add" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const SentBox = ({ count, label, bg }: { count: number; label: string; bg: string }) => (
  <View style={[styles.sentBox, { backgroundColor: bg }]}>
    <Text style={styles.sentNum}>{count}</Text>
    <Text style={styles.sentLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  // HERO
  hero: { width, height: 280, backgroundColor: "#2a1404", position: "relative" },
  heroImg: { ...StyleSheet.absoluteFillObject },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },
  backBtn: { position: "absolute", top: 50, left: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  favBtn: { position: "absolute", top: 50, right: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  dots: { position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.5)" },
  dotActive: { backgroundColor: "#ff6a00", width: 20 },
  ratingBadge: { position: "absolute", bottom: 14, right: 14, flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  ratingText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  // Info card (sobresale del hero)
  infoCard: { backgroundColor: "#fff", margin: 14, marginTop: -24, borderRadius: 18, padding: 18, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  storeName: { fontSize: 22, fontWeight: "900", color: "#1a1a1a" },
  typeChip: { backgroundColor: "#fff1e0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start", marginTop: 6 },
  typeChipText: { color: "#ff6a00", fontSize: 11, fontWeight: "800" },
  desc: { color: "#666", fontSize: 13, marginTop: 10, lineHeight: 19 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: "#555", fontWeight: "600", maxWidth: 200 },

  // Sentiment
  sentimentCard: { backgroundColor: "#fff", marginHorizontal: 14, borderRadius: 14, padding: 16, elevation: 1 },
  sentTitle: { fontWeight: "800", color: "#333", fontSize: 14 },
  sentSubtitle: { fontSize: 11, color: "#999", marginTop: 2, marginBottom: 12 },
  sentRow: { flexDirection: "row", gap: 8 },
  sentBox: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12 },
  sentNum: { fontSize: 22, fontWeight: "900", color: "#1a1a1a" },
  sentLabel: { fontSize: 11, color: "#555", fontWeight: "700", marginTop: 4 },
  sentEmpty: { color: "#999", textAlign: "center", paddingVertical: 10, fontSize: 12 },

  // Menu
  menuTitle: { fontSize: 18, fontWeight: "900", color: "#1a1a1a", paddingHorizontal: 14, marginTop: 18, marginBottom: 10 },
  menuEmpty: { alignItems: "center", padding: 30 },
  menuEmptyIcon: { fontSize: 48 },
  menuEmptyText: { color: "#888", marginTop: 8, fontWeight: "700" },
  product: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 14, padding: 10, marginBottom: 10, gap: 12, alignItems: "center", elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4 },
  productImg: { width: 70, height: 70, borderRadius: 12, backgroundColor: "#f0f0f0" },
  productPh: { justifyContent: "center", alignItems: "center" },
  productInfo: { flex: 1 },
  productName: { fontWeight: "800", color: "#1a1a1a", fontSize: 14 },
  productDesc: { fontSize: 12, color: "#777", marginTop: 2, lineHeight: 16 },
  productPrice: { fontSize: 15, fontWeight: "900", color: "#ff6a00", marginTop: 6 },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#ff6a00", justifyContent: "center", alignItems: "center", elevation: 4, shadowColor: "#ff6a00", shadowOpacity: 0.4, shadowRadius: 6 },
});

export default StoreDetailScreen;
