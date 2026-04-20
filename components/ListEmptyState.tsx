import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ListEmptyStateProps {
  iconName: keyof typeof Feather.glyphMap;
  message: string;
}

export const ListEmptyState = ({ iconName, message }: ListEmptyStateProps) => {
  return (
    <View style={styles.emptyContainer}>
      <Feather name={iconName} size={48} color="#E2E8F0" />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: { paddingVertical: 60, alignItems: "center", gap: 12 },
  emptyText: {
    color: "#94A3B8",
    fontFamily: "Prompt_400Regular",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
