import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Image, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { nestEndpoints, type VendorListItem } from "../../api/nestApi";
import { intelligenceEndpoints } from "../../api/intelligenceApi";
import StoreCard from "../../components/StoreCard";
import { useAuth } from "../../auth/AuthContext";

const { width } = Dimensions.get("window");

// Mismas imágenes que el HeroBanner del web
const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&h=560&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&h=560&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1400&h=560&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&h=560&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=1400&h=560&fit=crop&q=80",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1400&h=560&fit=crop&q=80",
];

const CATEGORIES = [
  { id: 1, name: "Comida Rápida", icon: "🍔", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&q=80" },
  { id: 2, name: "Pizza",         icon: "🍕", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&q=80" },
  { id: 3, name: "Sushi",         icon: "🍣", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=200&fit=crop&q=80" },
  { id: 4, name: "Café",          icon: "☕", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop&q=80" },
  { id: 5, name: "Postres",       icon: "🍰", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop&q=80" },
  { id: 6, name: "Bebidas",       icon: "🥤", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&h=200&fit=crop&q=80" },
  { id: 7, name: "Saludable",     icon: "🥗", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop&q=80" },
  { id: 8, name: "Mercado",       icon: "🛒", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&q=80" },
];

type StoreWith = VendorListItem & { estimatedMinutes?: number };

const HomeScreen = ({ navigation }: any) => {
  const { profile, token } = useAuth();
  const [stores, setStores] = useState<StoreWith[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotación del hero cada 4.5s
  useEffect(() => {
    const id = setInterval(() => setActiveSlide((i) => (i + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

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

  const top = stores.slice(0, 4);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={["#ff6a00"]} />}
    >
      {/* ─── HERO con carrusel y degradado, idéntico al web ─── */}
      <View style={styles.hero}>
        {HERO_SLIDES.map((src, i) => (
          <ImageBackground
            key={src}
            source={{ uri: src }}
            style={[styles.heroSlide, { opacity: i === activeSlide ? 1 : 0 }]}
            resizeMode="cover"
          />
        ))}

        {/* Gradient overlay simulado con 3 capas oscuras */}
        <View style={styles.heroOverlayTop} />
        <View style={styles.heroOverlay} />

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Entrega Rápida{"\n"}a Tu Puerta</Text>
          <Text style={styles.heroSubtitle}>
            {profile ? `¡Hola ${profile.firstName}!` : "Encuentra tus restaurantes favoritos cerca de ti"}
          </Text>

          <View style={styles.heroBtns}>
            <TouchableOpacity style={styles.heroCta} onPress={() => navigation.navigate("Stores")}>
              <Text style={styles.heroCtaText}>Explorar Tiendas</Text>
            </TouchableOpacity>
            {!token && (
              <TouchableOpacity style={styles.heroLogin} onPress={() => navigation.getParent()?.navigate("Auth")}>
                <Text style={styles.heroLoginText}>Iniciar sesión</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Dots */}
        <View style={styles.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.heroDot, i === activeSlide && styles.heroDotActive]}
              onPress={() => setActiveSlide(i)}
            />
          ))}
        </View>
      </View>

      {/* ─── Categorías populares ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        <View style={styles.catGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.id} style={styles.catCard} onPress={() => navigation.navigate("Stores")}>
              <View style={styles.catIconWrap}>
                <Text style={styles.catEmoji}>{c.icon}</Text>
              </View>
              <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ─── Recomendados (carrusel horizontal) ─── */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recomendados para Ti</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Stores")}>
            <Text style={styles.seeAll}>Ver todos →</Text>
          </TouchableOpacity>
        </View>
        {loading ? <ActivityIndicator color="#ff6a00" /> : (
          <FlatList
            horizontal
            data={top}
            keyExtractor={(item) => String(item.vendor_id)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recoCard}
                onPress={() => navigation.navigate("StoreDetail", { store: item })}
              >
                <Image source={{ uri: item.storefront_image_url ?? item.logo_url ?? HERO_SLIDES[0] }} style={styles.recoImg} />
                <View style={styles.recoBody}>
                  <Text style={styles.recoName} numberOfLines={1}>{item.business_name}</Text>
                  {item.business_type && <Text style={styles.recoType} numberOfLines={1}>{item.business_type}</Text>}
                  <View style={styles.recoMeta}>
                    {item.estimatedMinutes != null && (
                      <Text style={styles.recoTime}>⏱️ ~{item.estimatedMinutes} min</Text>
                    )}
                    {item.rating != null && (
                      <Text style={styles.recoRating}>⭐ {item.rating.toFixed(1)}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* ─── Tiendas cerca de ti ─── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tiendas cerca de ti</Text>
        {loading ? <ActivityIndicator color="#ff6a00" /> : stores.map((s) => (
          <StoreCard key={s.vendor_id} store={s} onPress={() => navigation.navigate("StoreDetail", { store: s })} />
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f8" },

  // ─── HERO ───
  hero: { height: 320, backgroundColor: "#2a1404", overflow: "hidden", position: "relative" },
  heroSlide: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  heroOverlayTop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(20,8,4,0.4)" },
  heroContent: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, padding: 22, justifyContent: "center" },
  heroTitle: { fontSize: 30, fontWeight: "900", color: "#fff", lineHeight: 36 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,224,190,0.95)", marginTop: 10, fontWeight: "600" },
  heroBtns: { flexDirection: "row", gap: 10, marginTop: 18, flexWrap: "wrap" },
  heroCta: { backgroundColor: "#ff6a00", paddingVertical: 13, paddingHorizontal: 28, borderRadius: 999, shadowColor: "#ff6a00", shadowOpacity: 0.45, shadowRadius: 10, elevation: 6 },
  heroCtaText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  heroLogin: { borderWidth: 1.5, borderColor: "#fff", paddingVertical: 13, paddingHorizontal: 24, borderRadius: 999 },
  heroLoginText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  heroDots: { position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.45)" },
  heroDotActive: { backgroundColor: "#ff6a00", width: 22 },

  // ─── Secciones ───
  section: { paddingHorizontal: 14, paddingTop: 18 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1a1a1a", marginBottom: 12 },
  seeAll: { color: "#ff6a00", fontWeight: "700", fontSize: 12, marginBottom: 12 },

  // ─── Categorías ───
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  catCard: { width: (width - 14 * 2 - 10 * 3) / 4, alignItems: "center" },
  catIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#fff", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  catEmoji: { fontSize: 28 },
  catName: { fontSize: 11, fontWeight: "700", color: "#444", marginTop: 6, textAlign: "center" },

  // ─── Recomendados ───
  recoCard: { width: 180, backgroundColor: "#fff", borderRadius: 14, marginRight: 12, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6 },
  recoImg: { width: "100%", height: 110, backgroundColor: "#eee" },
  recoBody: { padding: 10 },
  recoName: { fontWeight: "800", fontSize: 13, color: "#1a1a1a" },
  recoType: { fontSize: 11, color: "#ff6a00", marginTop: 2, fontWeight: "700" },
  recoMeta: { flexDirection: "row", gap: 10, marginTop: 8 },
  recoTime: { fontSize: 11, color: "#666", fontWeight: "700" },
  recoRating: { fontSize: 11, color: "#666", fontWeight: "700" },
});

export default HomeScreen;
