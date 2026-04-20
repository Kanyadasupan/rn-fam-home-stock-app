import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Feather } from "@expo/vector-icons";

interface ShoppingItemRowProps {
  item: any;
  onToggle: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}

export const ShoppingItemRow = ({
  item,
  onToggle,
  onEdit,
  onDelete,
}: ShoppingItemRowProps) => {
  // คำนวณราคารวมของรายการนี้ (ราคาต่อหน่วย x จำนวน)
  const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);

  const renderPriceDiff = () => {
    if (
      item.lastPrice == null ||
      Number(item.price) === 0 ||
      Number(item.lastPrice) === 0
    )
      return null;
    const diff = Number(item.price) - Number(item.lastPrice);

    if (diff > 0)
      return (
        <View style={[styles.diffBadge, styles.diffUp]}>
          <Feather name="trending-up" size={10} color="#DC2626" />
          <Text style={styles.diffUpText}> +฿{diff}</Text>
        </View>
      );
    if (diff < 0)
      return (
        <View style={[styles.diffBadge, styles.diffDown]}>
          <Feather name="trending-down" size={10} color="#059669" />
          <Text style={styles.diffDownText}> -฿{Math.abs(diff)}</Text>
        </View>
      );
    return (
      <View style={[styles.diffBadge, styles.diffSame]}>
        <Feather name="minus" size={10} color="#6B7280" />
        <Text style={styles.diffSameText}> คงที่</Text>
      </View>
    );
  };

  return (
    <View style={[styles.itemCard, item.is_bought && styles.itemCardBought]}>
      <TouchableOpacity
        style={styles.itemInfo}
        onPress={() => onToggle(item)}
        activeOpacity={0.7}
      >
        <View
          style={[styles.checkbox, item.is_bought && styles.checkboxChecked]}
        >
          {item.is_bought && <Feather name="check" size={16} color="#FFF" />}
        </View>

        {/* 📸 แสดงรูปภาพสินค้า (ถ้ามี) */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.itemImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="shopping-cart" size={14} color="#D1D5DB" />
          </View>
        )}

        <View style={{ flex: 1 }}>
          {/* 1. ชื่อรายการ */}
          <Text
            style={[styles.itemName, item.is_bought && styles.itemBought]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {/* 2. หมวดหมู่ */}
          {item.category && !item.is_bought && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryTag}>{item.category}</Text>
            </View>
          )}

          {/* 3. ส่วนแสดงราคา */}
          <View style={styles.detailsContainer}>
            <View style={styles.priceSection}>
              <Text
                style={[
                  styles.lineTotalText,
                  item.is_bought && { color: "#9CA3AF" },
                ]}
              >
                ฿{lineTotal.toLocaleString()}
              </Text>

              <Text style={styles.unitDetailText}>
                {item.quantity} {item.unit || "ชิ้น"} × ฿{item.price}
              </Text>
            </View>

            {!item.is_bought && renderPriceDiff()}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconBtn}>
          <Feather name="edit-2" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDelete(item)}
          style={[styles.iconBtn, styles.deleteBtn]}
        >
          <Feather name="trash-2" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12, // ลด padding เล็กน้อยเพื่อให้รูปดูเด่น
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemCardBought: {
    backgroundColor: "#F9FAFB",
    opacity: 0.7,
    borderColor: "transparent",
    shadowOpacity: 0,
  },
  itemInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemName: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  itemBought: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  categoryContainer: {
    marginBottom: 4,
    flexDirection: "row",
  },
  categoryTag: {
    fontSize: 10,
    backgroundColor: "#ECFDF5",
    color: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: "700",
    overflow: "hidden",
    textTransform: "uppercase",
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingRight: 10,
  },
  priceSection: {
    flex: 1,
  },
  lineTotalText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 1,
  },
  unitDetailText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  diffUp: { backgroundColor: "#FEE2E2" },
  diffUpText: { fontSize: 10, color: "#DC2626", fontWeight: "bold" },
  diffDown: { backgroundColor: "#D1FAE5" },
  diffDownText: { fontSize: 10, color: "#059669", fontWeight: "bold" },
  diffSame: { backgroundColor: "#F3F4F6" },
  diffSameText: { fontSize: 10, color: "#6B7280", fontWeight: "bold" },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  deleteBtn: {
    backgroundColor: "#FEF2F2",
  },
});
