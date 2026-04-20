import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface SessionCardProps {
  session: any;
  onPress: (session: any) => void;
  onDelete: (id: string) => void;
}

export const SessionCard = ({
  session,
  onPress,
  onDelete,
}: SessionCardProps) => {
  return (
    <View style={styles.sessionCard}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => {
          Haptics.selectionAsync();
          onPress(session);
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.sessionName}>{session.name}</Text>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={12} color="#94A3B8" />
          <Text style={styles.sessionDate}>
            {new Date(session.created_at).toLocaleDateString("th-TH")}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(session.id)}
        style={styles.deleteIconBtn}
      >
        <Feather name="trash-2" size={18} color="#FCA5A5" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sessionName: {
    fontSize: 16,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sessionDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: "Prompt_400Regular",
  },
  deleteIconBtn: {
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
});
