import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator } from "react-native";
import { nestEndpoints, type ProductListItem, type VendorListItem } from "../api/nestApi";
import { intelligenceEndpoints, type SentimentReport } from "../api/intelligenceApi";

interface Props {
  route: { params: { store: VendorListItem } };
}

const StoreDetailScreen: React.FC<Props> = ({ route }) => {
  const { store } = route.params;
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [sentiment, setSentiment] = useState<SentimentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Productos (NestJS) + reporte de sentimiento (FastAPI) en paralelo.
      const [prods, sent] = await Promise.all([
        nestEndpoints.listProductsByVendor(store.vendor_id).catch(() => [] as ProductListItem[]),
        intelligenceEndpoints.sentimentReport(store.vendor_id).catch(() => null),
      ]);
      setProducts(prods);
      setSentiment(sent);
      setLoading(false);
    })();
  }, [store.vendor_id]);

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.product_id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <>
          <View style={styles.hero}>
            <Text style={styles.heroName}>{store.business_name}</Text>
            {store.business_type && <Text style={styles.heroType}>{store.business_type}</Text>}
            {store.description && <Text style={styles.heroDesc}>{store.description}</Text>}
          </View>

          {/* Tarjeta de analítica del FastAPI */}
          <View style={styles.sentimentCard}>
            <Text style={styles.sentimentTitle}>📊 Reseñas analizadas con IA (FastAPI)</Text>
            {loading ? (
              <ActivityIndicator color="#ff6a00" />
            ) : sentiment ? (
              <View style={styles.sentimentRow}>
                <View style={[styles.sentimentBox, { backgroundColor: "#dcfce7" }]}>
                  <Text style={styles.sentimentNum}>{sentiment.positive}</Text>
                  <Text style={styles.sentimentLabel}>😊 Positivas</Text>
                </View>
                <View style={[styles.sentimentBox, { backgroundColor: "#fef9c3" }]}>
                  <Text style={styles.sentimentNum}>{sentiment.neutral}</Text>
                  <Text style={styles.sentimentLabel}>😐 Neutrales</Text>
                </View>
                <View style={[styles.sentimentBox, { backgroundColor: "#fee2e2" }]}>
                  <Text style={styles.sentimentNum}>{sentiment.negative}</Text>
                  <Text style={styles.sentimentLabel}>😞 Negativas</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.sentimentEmpty}>Sin reseñas aún</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Menú</Text>
        </>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator color="#ff6a00" style={{ marginTop: 30 }} />
        ) : (
          <Text style={styles.empty}>Este negocio aún no tiene productos publicados.</Text>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.product}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.productImg} />
          ) : (
            <View style={[styles.productImg, styles.productImgPh]}><Text>🍴</Text></View>
          )}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            {item.description && <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>}
            <Text style={styles.productPrice}>${item.price.toLocaleString("es-CO")}</Text>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 16 },
  hero: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  heroName: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  heroType: { fontSize: 13, color: "#ff6a00", fontWeight: "700", marginTop: 2 },
  heroDesc: { fontSize: 13, color: "#666", marginTop: 8, lineHeight: 18 },

  sentimentCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sentimentTitle: { fontSize: 13, fontWeight: "700", color: "#333", marginBottom: 12 },
  sentimentRow: { flexDirection: "row", gap: 8 },
  sentimentBox: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12 },
  sentimentNum: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  sentimentLabel: { fontSize: 11, color: "#555", marginTop: 4, fontWeight: "600" },
  sentimentEmpty: { textAlign: "center", color: "#999", paddingVertical: 10 },

  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1a1a1a", marginBottom: 10 },
  empty: { textAlign: "center", color: "#888", marginTop: 30 },

  product: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, padding: 10, marginBottom: 10, gap: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  productImg: { width: 70, height: 70, borderRadius: 10, backgroundColor: "#f0f0f0" },
  productImgPh: { justifyContent: "center", alignItems: "center" },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
  productDesc: { fontSize: 12, color: "#777", marginTop: 2 },
  productPrice: { fontSize: 14, fontWeight: "800", color: "#ff6a00", marginTop: 6 },
});

export default StoreDetailScreen;
