import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";

export const FamilyHeader = ({ family }: { family: any }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(family.name);
  const [isSaving, setIsSaving] = useState(false);

  // 🟢 1. เพิ่ม State สำหรับตรวจสอบ Owner
  const [isOwner, setIsOwner] = useState(false);

  // 🟢 2. ดึง User ปัจจุบันมาเช็คว่าเป็น Owner หรือเปล่า
  useEffect(() => {
    const checkOwner = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && family?.created_by === user.id) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    };
    checkOwner();
  }, [family]);

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(family.join_code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.94,
        useNativeDriver: true,
        tension: 100,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
      }),
    ]).start();

    Alert.alert("คัดลอกสำเร็จ", "ส่งรหัสนี้ให้สมาชิกเพื่อเข้าร่วมกลุ่ม");
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณาระบุชื่อครอบครัว");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("families")
        .update({ name: editName.trim() })
        .eq("id", family.id);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditModalVisible(false);
    } catch (error: any) {
      Alert.alert("อัปเดตไม่สำเร็จ", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.headerCard}>
      <View style={styles.infoSection}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Feather name="home" size={20} color="#10B981" />
          </View>
          <View style={styles.titleTextWrapper}>
            <View style={styles.nameWithEditRow}>
              <Text style={styles.familyName} numberOfLines={1}>
                {family.name}
              </Text>

              {isOwner && (
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => {
                    setEditName(family.name);
                    setEditModalVisible(true);
                  }}
                >
                  <Feather name="edit-2" size={16} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.subtitle}>พื้นที่จัดการรายการของในบ้าน</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Animated.View style={[styles.codeContainer, { transform: [{ scale }] }]}>
        <View style={styles.codeContent}>
          <Text style={styles.codeLabel}>รหัสเข้าร่วมกลุ่ม</Text>
          <Text style={styles.codeValue}>{family.join_code}</Text>
        </View>

        <TouchableOpacity
          style={styles.copyBtn}
          onPress={copyToClipboard}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#10B981", "#059669"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBtn}
          >
            <Feather name="copy" size={16} color="#fff" />
            <Text style={styles.copyBtnText}>คัดลอก</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>แก้ไขชื่อครอบครัว</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="ระบุชื่อครอบครัวใหม่..."
                placeholderTextColor="#94A3B8"
                autoFocus
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={styles.cancelBtnText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !editName.trim() && styles.saveBtnDisabled,
                ]}
                onPress={handleSaveName}
                disabled={!editName.trim() || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#1E293B",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
  },
  infoSection: {
    padding: 24,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  titleTextWrapper: {
    flex: 1,
  },
  nameWithEditRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  familyName: {
    fontSize: 24,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    flexShrink: 1,
  },
  editIconBtn: {
    padding: 6,
    marginLeft: 4,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Prompt_400Regular",
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 24,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 12,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  codeContent: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 10,
    fontFamily: "Prompt_600SemiBold",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 22,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    letterSpacing: 1.5,
  },
  copyBtn: {
    shadowColor: "#10B981",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  copyBtnText: {
    color: "#fff",
    fontFamily: "Prompt_700Bold",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 24,
  },
  input: {
    fontFamily: "Prompt_400Regular",
    fontSize: 16,
    color: "#1E293B",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: "Prompt_600SemiBold",
    color: "#64748B",
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    height: 50,
    backgroundColor: "#10B981",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  saveBtnText: {
    fontFamily: "Prompt_600SemiBold",
    color: "#FFFFFF",
    fontSize: 15,
  },
});
