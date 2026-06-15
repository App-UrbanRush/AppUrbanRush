import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNotifications } from "../context/NotificationsContext";

const NotificationBell = () => {
  const { notifications, unreadCount, connected, markAllRead, clearOne } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.btn} onPress={() => { setOpen(true); markAllRead(); }}>
        <Text style={styles.icon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text></View>
        )}
        <View style={[styles.dot, { backgroundColor: connected ? "#22c55e" : "#aaa" }]} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={() => setOpen(false)}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 12 }}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyText}>Sin notificaciones aún</Text>
              </View>
            ) : notifications.map((n) => (
              <View key={n.id} style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemBody}>{n.body}</Text>
                  <Text style={styles.itemTime}>{new Date(n.createdAt).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</Text>
                </View>
                <TouchableOpacity onPress={() => clearOne(n.id)}><Text style={styles.itemClose}>✕</Text></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  btn: { padding: 6, marginRight: 6 },
  icon: { fontSize: 22 },
  badge: { position: "absolute", top: 0, right: 0, backgroundColor: "#ff3d6e", borderRadius: 10, minWidth: 18, height: 18, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  dot: { position: "absolute", bottom: 4, right: 4, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: "#ff6a00" },
  modal: { flex: 1, backgroundColor: "#f7f7f8" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ff6a00", padding: 14, paddingTop: 50 },
  headerTitle: { color: "#fff", fontWeight: "800", fontSize: 17 },
  close: { color: "#fff", fontSize: 20, fontWeight: "700", paddingHorizontal: 6 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyIcon: { fontSize: 50 },
  emptyText: { color: "#888", marginTop: 8 },
  item: { flexDirection: "row", backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 8, alignItems: "flex-start", gap: 10 },
  itemTitle: { fontWeight: "700", color: "#222", fontSize: 14 },
  itemBody: { color: "#555", fontSize: 12.5, marginTop: 3 },
  itemTime: { color: "#999", fontSize: 11, marginTop: 6 },
  itemClose: { color: "#bbb", fontSize: 16, padding: 4 },
});

export default NotificationBell;
