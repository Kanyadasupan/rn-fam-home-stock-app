import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Button } from "@/components/Button";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const CATEGORIES = [
  "ของสด",
  "ของแห้ง",
  "เครื่องปรุง",
  "เครื่องดื่ม",
  "ของใช้ในบ้าน",
  "ขนม/ของว่าง",
  "อื่นๆ",
];
const UNITS = [
  "ชิ้น",
  "แพ็ค",
  "กก.",
  "กรัม",
  "ขวด",
  "ลิตร",
  "ถุง",
  "กล่อง",
  "ตัน",
];

export const ShoppingItemFormModal = ({
  visible,
  onClose,
  onSave,
  formData,
  setFormData,
  isEditing,
  loading,
  uniqueNames,
}: any) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const isInvalid = !formData.name?.trim() || !formData.category;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled)
      setFormData({ ...formData, imageUri: result.assets[0].uri });
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted")
      return Alert.alert(
        "ขอสิทธิ์เข้าถึงกล้อง",
        "เราต้องขอสิทธิ์เข้าถึงกล้องเพื่อถ่ายรูปสินค้า",
      );
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled)
      setFormData({ ...formData, imageUri: result.assets[0].uri });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.modalContent}
            >
              <View style={styles.dragHandle} />

              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.modalHeader}>
                    {isEditing ? "แก้ไขรายละเอียด" : "เพิ่มรายการใหม่"}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    ระบุข้อมูลสินค้าที่ต้องการซื้อ
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: "85%" }}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.label}>รูปภาพสินค้า</Text>
                <View style={styles.imagePickerContainer}>
                  <TouchableOpacity
                    style={styles.imageBox}
                    onPress={pickImage}
                    activeOpacity={0.8}
                  >
                    {formData.imageUri ? (
                      <Image
                        source={{ uri: formData.imageUri }}
                        style={styles.previewImage}
                      />
                    ) : (
                      <View style={styles.placeholderBox}>
                        <Feather name="image" size={24} color="#10B981" />
                        <Text style={styles.placeholderText}>เลือกรูป</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cameraBtn}
                    onPress={takePhoto}
                    activeOpacity={0.8}
                  >
                    <Feather name="camera" size={18} color="#FFF" />
                    <Text style={styles.cameraBtnText}>ถ่ายรูปใหม่</Text>
                  </TouchableOpacity>
                  {formData.imageUri && (
                    <TouchableOpacity
                      style={styles.removeImgBtn}
                      onPress={() =>
                        setFormData({ ...formData, imageUri: null })
                      }
                    >
                      <Feather name="trash-2" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 🏷️ Item Name Section */}
                <View style={[styles.inputGroup, { zIndex: 1000 }]}>
                  <Text style={styles.label}>ชื่อสินค้า</Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      showSuggestions &&
                        formData.name?.length > 0 &&
                        styles.inputWithSuggestions,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(t) => {
                        setFormData({ ...formData, name: t });
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="ระบุชื่อสินค้า..."
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  {showSuggestions && formData.name?.length > 0 && (
                    <View style={styles.suggestionBox}>
                      {uniqueNames
                        ?.filter(
                          (n: string) =>
                            n
                              ?.toLowerCase()
                              .includes(formData.name.toLowerCase()) &&
                            n !== formData.name,
                        )
                        .slice(0, 4)
                        .map((suggestion: string, index: number) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.suggestionItem}
                            activeOpacity={0.6}
                            onPress={() => {
                              setFormData({ ...formData, name: suggestion });
                              setShowSuggestions(false);
                              Keyboard.dismiss();
                            }}
                          >
                            <View style={styles.suggestionIconWrapper}>
                              <Feather name="clock" size={12} color="#94A3B8" />
                            </View>
                            <Text style={styles.suggestionText}>
                              {suggestion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </View>

                <Text style={styles.label}>หมวดหมู่</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipContainer}
                >
                  {CATEGORIES.map((cat, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.chip,
                        formData.category === cat && styles.chipSelected,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, category: cat })
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.category === cat && styles.chipTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.row}>
                  <View style={styles.inputGroupSmall}>
                    <Text style={styles.label}>จำนวน</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={
                          !formData.quantity ||
                          formData.quantity.toString() === "1" ||
                          formData.quantity.toString() === "0" ||
                          formData.quantity.toString() === ""
                            ? ""
                            : formData.quantity.toString()
                        }
                        onChangeText={(t) =>
                          setFormData({ ...formData, quantity: t })
                        }
                        placeholder="1"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroupSmall}>
                    <Text style={styles.label}>ราคา/หน่วย</Text>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        value={
                          !formData.price ||
                          formData.price.toString() === "0" ||
                          formData.price.toString() === "0.00" ||
                          formData.price.toString() === ""
                            ? ""
                            : formData.price.toString()
                        }
                        onChangeText={(t) =>
                          setFormData({ ...formData, price: t })
                        }
                        placeholder="0.00"
                        placeholderTextColor="#94A3B8"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                <Text style={styles.label}>หน่วยนับ</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.chipContainer}
                >
                  {UNITS.map((unit, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.chip,
                        formData.unit === unit && styles.chipSelected,
                      ]}
                      onPress={() => setFormData({ ...formData, unit: unit })}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          formData.unit === unit && styles.chipTextSelected,
                        ]}
                      >
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.actionSection}>
                  <Button
                    title={isEditing ? "บันทึกการแก้ไข" : "เพิ่มรายการสินค้า"}
                    onPress={onSave}
                    loading={loading}
                    disabled={isInvalid}
                  />
                  <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                    <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: "92%",
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  modalHeader: {
    fontSize: 24,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Prompt_400Regular",
    color: "#64748B",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  imagePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: { width: "100%", height: "100%" },
  placeholderBox: { alignItems: "center" },
  placeholderText: {
    fontSize: 11,
    color: "#10B981",
    fontFamily: "Prompt_700Bold",
    marginTop: 4,
  },
  cameraBtn: {
    backgroundColor: "#10B981",
    height: 80,
    flex: 1,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  cameraBtnText: { color: "#FFF", fontFamily: "Prompt_700Bold", fontSize: 15 },
  removeImgBtn: {
    width: 48,
    height: 48,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: "Prompt_600SemiBold",
    color: "#475569",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputGroup: { marginBottom: 24, position: "relative" },
  row: { flexDirection: "row", gap: 16, marginBottom: 24 },
  inputGroupSmall: { flex: 1 },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    height: 56,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inputWithSuggestions: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: "#10B981",
    backgroundColor: "#FFF",
    borderBottomWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    color: "#1E293B",
  },
  chipContainer: { flexDirection: "row", marginBottom: 24 },
  chip: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 16,
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  chipSelected: { backgroundColor: "#ECFDF5", borderColor: "#10B981" },
  chipText: { color: "#64748B", fontSize: 14, fontFamily: "Prompt_400Regular" },
  chipTextSelected: { color: "#059669", fontFamily: "Prompt_700Bold" },
  suggestionBox: {
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: "absolute",
    top: 56 + 24,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderWidth: 1.5,
    borderColor: "#10B981",
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  suggestionItem: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  suggestionIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    fontFamily: "Prompt_400Regular",
    color: "#1E293B",
  },
  actionSection: { marginTop: 12 },
  cancelBtn: { paddingVertical: 16 },
  cancelBtnText: {
    textAlign: "center",
    color: "#94A3B8",
    fontFamily: "Prompt_600SemiBold",
  },
});
