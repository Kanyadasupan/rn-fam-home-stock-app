import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Button } from "@/components/Button";
import { Feather } from "@expo/vector-icons";

export const JoinFamilyModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
}: any) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    if (visible) setCode("");
  }, [visible]);

  const isInvalid = !code.trim();

  const handlePressSubmit = () => {
    const cleanCode = code.trim().toUpperCase();

    if (cleanCode.length < 6) {
      return Alert.alert("รหัสไม่ครบ", "กรุณากรอกรหัสของเพื่อนให้ครบ 6 หลัก", [
        { text: "ตกลง" },
      ]);
    }

    // ส่งรหัสออกไปให้ฟังก์ชันในหน้าหลักเช็คกับ Database
    onSubmit(cleanCode);
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
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.sheetContainer}
            >
              <View style={styles.dragHandle} />

              <View style={styles.headerRow}>
                <View style={styles.titleSection}>
                  <View style={styles.iconBadge}>
                    <Feather name="key" size={18} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.modalHeader}>เข้าร่วมครอบครัว</Text>
                    <Text style={styles.modalSubtitle}>
                      ใส่รหัสเพื่อเริ่มแชร์รายการช้อปปิ้ง
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>รหัสคำเชิญ (JOIN CODE)</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="กรอกรหัส 6 หลัก"
                    placeholderTextColor="#94A3B8"
                    value={code}
                    onChangeText={setCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={6}
                    autoFocus={true}
                    onSubmitEditing={handlePressSubmit}
                  />
                  {code.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setCode("")}
                      style={styles.clearBtn}
                    >
                      <Feather name="x-circle" size={18} color="#CBD5E1" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.buttonWrapper}>
                <Button
                  title="ยืนยันการเข้าร่วม"
                  onPress={handlePressSubmit}
                  loading={loading}
                  disabled={isInvalid}
                />
              </View>

              <View style={{ height: Platform.OS === "ios" ? 34 : 20 }} />
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
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -10 },
    shadowRadius: 24,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  titleSection: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "Prompt_400Regular",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  inputGroup: { marginBottom: 32 },
  label: {
    fontSize: 12,
    fontFamily: "Prompt_600SemiBold",
    color: "#475569",
    marginBottom: 10,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    height: 60,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    letterSpacing: 2,
    height: "100%",
  },
  clearBtn: { padding: 4 },
  buttonWrapper: { marginBottom: 10 },
});
