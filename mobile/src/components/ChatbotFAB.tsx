import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { chatbotApi, type ChatResponse, type UserAudience } from "../api/chatbotApi";
import { useAuth } from "../auth/AuthContext";

const audienceFromRole = (role?: string, isAuth?: boolean): UserAudience => {
  if (!isAuth) return "GUEST";
  switch (role) {
    case "Domiciliario": return "COURIER";
    case "Negocio": return "VENDOR";
    case "Administrador":
    case "SuperAdmin": return "ADMIN";
    default: return "CUSTOMER";
  }
};

interface Turn { id: string; from: "user" | "bot"; text: string; quickReplies?: ChatResponse["quickReplies"]; }

const ChatbotFAB = () => {
  const { user, token, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  const audience = audienceFromRole(user?.role, !!token);

  const openChat = () => {
    setOpen(true);
    if (turns.length === 0) {
      setTurns([{
        id: "init", from: "bot",
        text: "¡Hola! Soy Urby 🛵, el asistente de UrbanRush. ¿En qué te ayudo?",
        quickReplies: [
          { label: "¿Cómo pido?", value: "¿Cómo pido?" },
          { label: "Buscar tienda", value: "busco pizza" },
          ...(token ? [{ label: "Estado de mi pedido", value: "Estado de mi pedido" }] : [{ label: "Cómo registrarme", value: "Cómo me registro" }]),
        ],
      }]);
    }
  };

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    setTurns((prev) => [...prev, { id: `${Date.now()}-u`, from: "user", text: clean }]);
    setInput("");
    setBusy(true);
    try {
      const res = await chatbotApi.ask(clean, {
        audience,
        userId: user?.id,
        userName: profile ? `${profile.firstName} ${profile.firstLastName}` : undefined,
      });
      setTurns((prev) => [...prev, { id: `${Date.now()}-b`, from: "bot", text: res.reply, quickReplies: res.quickReplies }]);
    } catch {
      setTurns((prev) => [...prev, { id: `${Date.now()}-b`, from: "bot", text: "Uy, no pude responder. Probá de nuevo." }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.fab} onPress={openChat}>
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f7f7f8" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.header}>
            <Text style={styles.headerIcon}>🛵</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerName}>Urby</Text>
              <Text style={styles.headerStatus}>Asistente UrbanRush</Text>
            </View>
            <TouchableOpacity onPress={() => setOpen(false)}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.msgs}>
            {turns.map((t) => (
              <View key={t.id} style={[styles.row, t.from === "user" ? styles.rowUser : styles.rowBot]}>
                <View style={[styles.bubble, t.from === "user" ? styles.bubbleUser : styles.bubbleBot]}>
                  <Text style={[styles.bubbleText, t.from === "user" && { color: "#fff" }]}>{t.text}</Text>
                </View>
                {t.quickReplies && (
                  <View style={styles.quick}>
                    {t.quickReplies.map((q, i) => (
                      <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => send(q.value)}>
                        <Text style={styles.quickText}>{q.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
            {busy && <ActivityIndicator color="#ff6a00" style={{ marginTop: 10 }} />}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribí tu mensaje..."
              placeholderTextColor="#aaa"
              onSubmitEditing={() => send(input)}
            />
            <TouchableOpacity style={styles.send} onPress={() => send(input)} disabled={busy || !input.trim()}>
              <Text style={styles.sendText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: { position: "absolute", bottom: 80, right: 18, width: 56, height: 56, borderRadius: 28, backgroundColor: "#ff6a00", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  fabIcon: { fontSize: 26 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#ff6a00", padding: 14, paddingTop: 50 },
  headerIcon: { fontSize: 28 },
  headerName: { color: "#fff", fontWeight: "800", fontSize: 16 },
  headerStatus: { color: "#fff", opacity: 0.9, fontSize: 11 },
  close: { color: "#fff", fontSize: 22, fontWeight: "700", paddingHorizontal: 6 },
  msgs: { padding: 12, paddingBottom: 16 },
  row: { marginBottom: 10, maxWidth: "85%" },
  rowUser: { alignSelf: "flex-end" },
  rowBot: { alignSelf: "flex-start" },
  bubble: { padding: 12, borderRadius: 14 },
  bubbleUser: { backgroundColor: "#ff6a00", borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: "#fff", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: "#ececec" },
  bubbleText: { fontSize: 14, lineHeight: 20, color: "#222" },
  quick: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  quickBtn: { borderWidth: 1, borderColor: "#ff6a00", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#fff" },
  quickText: { fontSize: 12, color: "#ff6a00", fontWeight: "700" },
  inputRow: { flexDirection: "row", padding: 10, gap: 8, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#eee" },
  input: { flex: 1, paddingHorizontal: 14, backgroundColor: "#f3f3f5", borderRadius: 24, fontSize: 14, color: "#222" },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#ff6a00", justifyContent: "center", alignItems: "center" },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});

export default ChatbotFAB;
