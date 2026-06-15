import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const options = [
  { key: "RegisterCustomer", title: "Soy cliente", desc: "Quiero pedir comida y productos a domicilio", icon: "🛒" },
  { key: "RegisterCourier",  title: "Soy domiciliario", desc: "Quiero entregar pedidos y ganar dinero", icon: "🛵" },
  { key: "RegisterVendor",   title: "Tengo un negocio", desc: "Quiero vender en UrbanRush", icon: "🏪" },
];

const RegisterSelectScreen = ({ navigation }: any) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>¿Cómo querés registrarte?</Text>
      <Text style={styles.subtitle}>Elegí el tipo de cuenta que mejor describe lo que vas a hacer</Text>

      {options.map((o) => (
        <TouchableOpacity key={o.key} style={styles.card} onPress={() => navigation.navigate(o.key)}>
          <Text style={styles.cardIcon}>{o.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{o.title}</Text>
            <Text style={styles.cardDesc}>{o.desc}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Volver al login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 50, backgroundColor: "#fff7f0", minHeight: "100%" },
  title: { fontSize: 24, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4, marginBottom: 22 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, gap: 12 },
  cardIcon: { fontSize: 36 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1a1a1a" },
  cardDesc: { fontSize: 12, color: "#777", marginTop: 2 },
  arrow: { fontSize: 26, color: "#ff6a00", fontWeight: "300" },
  backBtn: { marginTop: 24, alignItems: "center" },
  backText: { color: "#ff6a00", fontWeight: "700" },
});

export default RegisterSelectScreen;
