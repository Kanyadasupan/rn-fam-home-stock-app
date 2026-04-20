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
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CreateSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  loading: boolean;
}

export const CreateSessionModal = ({
  visible,
  onClose,
  onSubmit,
  loading,
}: CreateSessionModalProps) => {
  const [sessionName, setSessionName] = useState("");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setSessionName("");
  }, [visible]);

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
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -20} 
              style={{ width: "100%" }}
            >
              <View 
                style={[
                  styles.modalContent, 
                  { paddingBottom: Math.max(insets.bottom + 20, 40) } 
                ]}
              >
                <View style={styles.dragHandle} />
                <Text style={styles.modalHeader}>ตั้งชื่อทริปซื้อของ</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.modalInput}
                    value={sessionName}
                    onChangeText={setSessionName}
                    placeholder="เช่น ของเข้าบ้านอาทิตย์นี้"
                    placeholderTextColor="#94A3B8"
                    autoFocus={true}
                  />
                </View>

                <View style={{ height: 24 }} />

                <Button
                  title="เริ่มทริปซื้อของ"
                  onPress={() => onSubmit(sessionName)}
                  loading={loading}
                  disabled={!sessionName.trim()}
                />

                <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
                  <Text style={styles.cancelLinkText}>ยกเลิก</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#FFF",
    paddingHorizontal: 28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    width: "100%",
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 12,
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    paddingHorizontal: 16,
    height: 60,
    justifyContent: "center",
  },
  modalInput: {
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Prompt_400Regular",
  },
  cancelLink: { marginTop: 20 },
  cancelLinkText: {
    textAlign: "center",
    color: "#94A3B8",
    fontFamily: "Prompt_600SemiBold",
  },
});