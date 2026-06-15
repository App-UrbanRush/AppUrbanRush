import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { intelligenceEndpoints, type DailyStat, type SentimentReport, type VendorSummary } from "../../api/intelligenceApi";
import { nestEndpoints } from "../../api/nestApi";

const VendorAnalyticsScreen = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [sentiment, setSentiment] = useState<SentimentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        // Sacar el vendor_id real, no es lo mismo que user.id
        const profile = await nestEndpoints.vendorProfile();
        const vendorId = profile.vendor_id;
        const [s, d, sn] = await Promise.allSettled([
          intelligenceEndpoints.vendorSummary(vendorId),
          intelligenceEndpoints.vendorDaily(vendorId, 7),
          intelligenceEndpoints.sentimentReport(vendorId),
        ]);
        if (s.status === "fulfilled") setSummary(s.value);
        if (d.status === "fulfilled") setDaily(d.value);
        if (sn.status === "fulfilled") setSentiment(sn.value);
      } catch {} finally { setLoading(false); }
    })();
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  const maxRevenue = Math.max(...daily.map((d) => d.revenue), 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Analítica</Text>
      <Text style={styles.subtitle}>KPIs y sentimiento — datos procesados por el backend 2 (FastAPI)</Text>

      <View style={styles.kpis}>
        <KPI label="Pedidos totales" value={String(summary?.total_orders ?? 0)} color="#dbeafe" />
        <KPI label="Ingresos" value={`$${(summary?.total_revenue ?? 0).toLocaleString("es-CO")}`} color="#dcfce7" />
        <KPI label="Ticket promedio" value={`$${Math.round(summary?.avg_ticket ?? 0).toLocaleString("es-CO")}`} color="#fff1e0" />
        <KPI label="Entrega prom. (min)" value={summary?.avg_delivery_minutes != null ? String(Math.round(summary.avg_delivery_minutes)) : "—"} color="#fef9c3" />
      </View>

      {daily.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 Últimos {daily.length} días</Text>
          <View style={styles.chart}>
            {daily.map((d, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={{ height: `${(d.revenue / maxRevenue) * 100}%`, backgroundColor: "#ff6a00", width: "60%", borderRadius: 4 }} />
                <Text style={styles.chartLabel}>{d.date.slice(5)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {sentiment && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Sentimiento de reseñas (IA)</Text>
          <Text style={styles.sentTotal}>{sentiment.total_reviews} reseñas analizadas</Text>
          <View style={styles.sentRow}>
            <View style={[styles.sentBox, { backgroundColor: "#dcfce7" }]}>
              <Text style={styles.sentNum}>{sentiment.positive}</Text>
              <Text style={styles.sentLabel}>😊 Positivas</Text>
            </View>
            <View style={[styles.sentBox, { backgroundColor: "#fef9c3" }]}>
              <Text style={styles.sentNum}>{sentiment.neutral}</Text>
              <Text style={styles.sentLabel}>😐 Neutras</Text>
            </View>
            <View style={[styles.sentBox, { backgroundColor: "#fee2e2" }]}>
              <Text style={styles.sentNum}>{sentiment.negative}</Text>
              <Text style={styles.sentLabel}>😞 Negativas</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const KPI = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={[styles.kpi, { backgroundColor: color }]}>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={styles.kpiValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 14 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 12, color: "#777", marginTop: 4, marginBottom: 18 },
  kpis: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpi: { width: "48%", padding: 14, borderRadius: 12 },
  kpiLabel: { fontSize: 11, color: "#666", fontWeight: "700" },
  kpiValue: { fontSize: 17, fontWeight: "800", color: "#1a1a1a", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginTop: 14, elevation: 2 },
  cardTitle: { fontWeight: "800", color: "#444", marginBottom: 12 },
  chart: { flexDirection: "row", height: 120, alignItems: "flex-end", gap: 4 },
  chartCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
  chartLabel: { fontSize: 9, color: "#888", marginTop: 4 },
  sentTotal: { color: "#666", fontSize: 12, marginBottom: 12 },
  sentRow: { flexDirection: "row", gap: 8 },
  sentBox: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12 },
  sentNum: { fontSize: 20, fontWeight: "800", color: "#1a1a1a" },
  sentLabel: { fontSize: 11, color: "#555", marginTop: 4, fontWeight: "600" },
});

export default VendorAnalyticsScreen;
