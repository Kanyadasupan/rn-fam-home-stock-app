import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TripSummaryFooterProps {
  totalSpent: number;
  boughtCount: number;
  totalCount: number;
}

export const TripSummaryFooter = ({
  totalSpent,
  boughtCount,
  totalCount,
}: TripSummaryFooterProps) => {
  return (
    <View style={styles.summaryFooter}>
      <View>
        <Text style={styles.summaryLabel}>ยอดรวมที่ใช้ไป</Text>
        <Text style={styles.summaryTotal}>฿ {totalSpent.toLocaleString()}</Text>
      </View>
      <View style={styles.summaryBadge}>
        <Text style={styles.badgeText}>
          {boughtCount}/{totalCount} ชิ้น
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  summaryFooter: {
    marginTop: 20,
    backgroundColor: "#F0FDF4",
    padding: 16,
    borderRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  summaryLabel: {
    fontFamily: "Prompt_600SemiBold",
    color: "#059669",
    fontSize: 12,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  summaryTotal: {
    fontFamily: "Prompt_700Bold",
    color: "#064E3B",
    fontSize: 24,
  },
  summaryBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { color: "#FFF", fontFamily: "Prompt_700Bold", fontSize: 12 },
});
