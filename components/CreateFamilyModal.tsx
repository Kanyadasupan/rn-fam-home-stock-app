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
} from "react-native";
import { Button } from "@/components/Button";
import { Feather } from "@expo/vector-icons";

export const CreateFamilyModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
}: any) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (visible) setName("");
  }, [visible]);

  const isInvalid = !name.trim();

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
                <View>
                  <Text style={styles.modalHeader}>สร้างกลุ่มใหม่</Text>
                  <Text style={styles.modalSubtitle}>
                    เริ่มแชร์รายการช้อปปิ้งกับครอบครัว
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={20} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ชื่อกลุ่มครอบครัว</Text>
                <View style={styles.inputWrapper}>
                  <Feather
                    name="home"
                    size={18}
                    color="#10B981"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="เช่น บ้านแสนสุข, ของกินคอนโด"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    autoFocus={true}
                  />
                </View>
              </View>

              <View style={styles.buttonWrapper}>
                <Button
                  title="ยืนยันการสร้างกลุ่ม"
                  onPress={() => onSubmit(name)}
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
  modalHeader: {
    fontSize: 24,
    color: "#1E293B",
    fontFamily: "Prompt_700Bold",
    letterSpacing: -0.5,
    marginBottom: 4,
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
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 10,
    marginLeft: 4,
    fontFamily: "Prompt_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Prompt_400Regular",
  },
  buttonWrapper: {
    marginBottom: 10,
  },
});
