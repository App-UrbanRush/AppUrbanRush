import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { intelligenceEndpoints, type DeliveryEstimate, type SentimentAnalysis } from "../../api/intelligenceApi";

/**
 * Esta pantalla expone visualmente los endpoints del backend 2 (FastAPI):
 *   - POST /delivery-time/estimate
 *   - POST /sentiment/analyze
 *
 * Sirve para demostrarle a tu profe que el móvil consume los DOS backends.
 */
const IntelligenceScreen = () => {
  // ───── Estimador de tiempo de entrega ─────
  const [distance, setDistance] = useState("3");
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);

  const onEstimate = async () => {
    const km = parseFloat(distance);
    if (isNaN(km) || km <= 0) {
      Alert.alert("Distancia inválida", "Ingresá un número en kilómetros");
      return;
    }
    setEstimating(true);
    try {
      const res = await intelligenceEndpoints.estimateDelivery({
        distance_km: km,
        hour: new Date().getHours(),
      });
      setEstimate(res);
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servicio de inteligencia");
    } finally {
      setEstimating(false);
    }
  };

  // ───── Análisis de sentimiento ─────
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);

  const onAnalyze = async () => {
    if (!text.trim()) {
      Alert.alert("Texto vacío", "Escribí algo para analizar");
      return;
    }
    setAnalyzing(true);
    try {
      const res = await intelligenceEndpoints.analyzeSentiment(text.trim());
      setSentiment(res);
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servicio");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 Inteligencia (FastAPI)</Text>
        <Text style={styles.subtitle}>Endpoints del backend 2 para predicción y análisis</Text>
      </View>

      {/* ─── Estimador ─── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Estimar tiempo de entrega</Text>
        <Text style={styles.cardHint}>Predice cuánto va a demorar un pedido según la distancia y la hora.</Text>

        <Text style={styles.label}>Distancia (km)</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={distance}
          onChangeText={setDistance}
          placeholder="Ej. 3.5"
        />

        <TouchableOpacity style={styles.button} onPress={onEstimate} disabled={estimating}>
          {estimating ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Calcular</Text>}
        </TouchableOpacity>

        {estimate && (
          <View style={styles.result}>
            <Text style={styles.resultBig}>{estimate.estimated_minutes} min</Text>
            <Text style={styles.resultSmall}>
              Tiempo estimado para {distance} km a las {new Date().getHours()}h
              {estimate.confidence != null && ` · confianza ${Math.round(estimate.confidence * 100)}%`}
            </Text>
          </View>
        )}
      </View>

      {/* ─── Sentimiento ─── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Analizar sentimiento de reseña</Text>
        <Text style={styles.cardHint}>Clasifica un texto como positivo, neutro o negativo.</Text>

        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Escribí una reseña de prueba..."
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity style={styles.button} onPress={onAnalyze} disabled={analyzing}>
          {analyzing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analizar</Text>}
        </TouchableOpacity>

        {sentiment && (
          <View
            style={[
              styles.result,
              {
                backgroundColor:
                  sentiment.sentiment === "POSITIVE" ? "#dcfce7"
                  : sentiment.sentiment === "NEGATIVE" ? "#fee2e2"
                  : "#fef9c3",
              },
            ]}
          >
            <Text style={styles.resultBig}>
              {sentiment.sentiment === "POSITIVE" ? "😊 Positivo"
              : sentiment.sentiment === "NEGATIVE" ? "😞 Negativo"
              : "😐 Neutro"}
            </Text>
            <Text style={styles.resultSmall}>Score: {sentiment.score.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  subtitle: { fontSize: 12, color: "#777", marginTop: 2 },

  card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  cardHint: { fontSize: 12, color: "#888", marginTop: 4, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: { backgroundColor: "#f6f6f8", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#222" },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  button: { marginTop: 12, backgroundColor: "#ff6a00", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  result: { marginTop: 14, padding: 14, borderRadius: 12, backgroundColor: "#fff1e0", alignItems: "center" },
  resultBig: { fontSize: 22, fontWeight: "800", color: "#1a1a1a" },
  resultSmall: { fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" },
});

export default IntelligenceScreen;
