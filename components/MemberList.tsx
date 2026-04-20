import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";

export const MemberList = ({ members = [] }: { members: any[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedMembers = [...members].sort((a, b) =>
    a.role === "admin" ? -1 : 1,
  );

  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.headerContainer}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.titleWrapper}>
          <View style={styles.iconBox}>
            <Feather name="users" size={18} color="#10B981" />
          </View>
          <Text style={styles.sectionTitle}>สมาชิกในบ้าน</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{members.length}</Text>
          </View>
        </View>

        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#94A3B8"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.listContainer}>
          {sortedMembers.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>ยังไม่มีสมาชิกในกลุ่มนี้</Text>
            </View>
          ) : (
            sortedMembers.map((m, index) => {
              const name = m.profiles?.username || "สมาชิก";
              const isAdmin = m.role === "admin";

              return (
                <View
                  key={m.id}
                  style={[styles.memberItem, index === 0 && { marginTop: 8 }]}
                >
                  <View style={styles.memberLeft}>
                    <View
                      style={[
                        styles.avatarCircle,
                        isAdmin ? styles.adminAvatar : styles.memberAvatar,
                      ]}
                    >
                      <Feather
                        name={isAdmin ? "shield" : "user"}
                        size={16}
                        color={isAdmin ? "#10B981" : "#64748B"}
                      />
                    </View>

                    <View style={styles.nameContent}>
                      <Text style={styles.memberName} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.roleLabel}>
                        {isAdmin ? "ผู้ดูแลกลุ่ม" : "สมาชิก"}
                      </Text>
                    </View>
                  </View>

                  {isAdmin && (
                    <View style={styles.adminTag}>
                      <Feather name="star" size={10} color="#059669" />
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginBottom: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    // Soft Shadow
    shadowColor: "#1E293B",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
  },
  countBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 12,
    fontFamily: "Prompt_700Bold",
    color: "#64748B",
  },
  listContainer: {
    marginTop: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 22,
    padding: 8,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  memberLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  adminAvatar: {
    backgroundColor: "#ECFDF5",
  },
  memberAvatar: {
    backgroundColor: "#F1F5F9",
  },
  nameContent: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontFamily: "Prompt_600SemiBold",
    color: "#1E293B",
  },
  roleLabel: {
    fontSize: 11,
    fontFamily: "Prompt_400Regular",
    color: "#94A3B8",
    marginTop: 1,
  },
  adminTag: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyBox: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    fontFamily: "Prompt_400Regular",
  },
});
