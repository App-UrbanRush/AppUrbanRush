import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { nestEndpoints } from "../../api/nestApi";

const EarningsScreen = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    nestEndpoints.myEarnings(user.id)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#ff6a00" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💰 Mis ganancias</Text>

      <View style={styles.kpiRow}>
        <View style={[styles.kpi, { backgroundColor: "#fff1e0" }]}>
          <Text style={styles.kpiLabel}>Total ganado</Text>
          <Text style={styles.kpiValue}>${(data?.total ?? 0).toLocaleString("es-CO")}</Text>
        </View>
        <View style={[styles.kpi, { backgroundColor: "#dcfce7" }]}>
          <Text style={styles.kpiLabel}>Pedidos</Text>
          <Text style={styles.kpiValue}>{data?.total_orders ?? 0}</Text>
        </View>
      </View>

      <View style={[styles.kpi, { backgroundColor: "#dbeafe", marginTop: 12 }]}>
        <Text style={styles.kpiLabel}>Pendiente de liquidar</Text>
        <Text style={styles.kpiValue}>${(data?.pending ?? 0).toLocaleString("es-CO")}</Text>
      </View>

      <Text style={styles.hint}>
        Las liquidaciones se procesan automáticamente cada período. Consultá los detalles desde la versión web si necesitás más información.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a", marginBottom: 18 },
  kpiRow: { flexDirection: "row", gap: 12 },
  kpi: { flex: 1, padding: 18, borderRadius: 14 },
  kpiLabel: { fontSize: 11, color: "#666", fontWeight: "700" },
  kpiValue: { fontSize: 20, fontWeight: "800", color: "#1a1a1a", marginTop: 4 },
  hint: { color: "#888", fontSize: 12, marginTop: 18, lineHeight: 18 },
});

export default EarningsScreen;
