import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Feather } from "@expo/vector-icons";

export const ForgotPasswordModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSecure, setIsSecure] = useState(true);

  const handleClose = () => {
    setStep(1);
    setEmail("");
    setOtp("");
    setNewPassword("");
    onClose();
  };

  const handleSendOTP = async () => {
    if (!email.trim()) return Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมลของคุณ");

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);

    if (error) {
      Alert.alert("ผิดพลาด", error.message);
    } else {
      // 🟢 แก้ข้อความแจ้งเตือน ไม่ระบุจำนวนหลัก
      Alert.alert("ส่งรหัสสำเร็จ", "กรุณานำรหัสจากอีเมลมากรอกในแอป");
      setStep(2);
    }
  };

  const handleVerifyAndReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      return Alert.alert(
        "แจ้งเตือน",
        "กรุณากรอกรหัส OTP และรหัสผ่านใหม่ให้ครบ",
      );
    }

    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "recovery",
      });

      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      Alert.alert(
        "สำเร็จ",
        "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
      );
      handleClose();
    } catch (error: any) {
      Alert.alert("เกิดข้อผิดพลาด", "รหัส OTP ไม่ถูกต้อง หรือหมดอายุแล้ว");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            handleClose();
          }}
        >
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContent}
        >
          <View style={styles.dragHandle} />

          {step === 1 ? (
            <>
              <Text style={styles.modalHeader}>ลืมรหัสผ่านใช่ไหม?</Text>
              {/* 🟢 แก้คำอธิบาย ไม่ระบุ 6 หลัก */}
              <Text style={styles.modalSubtitle}>
                กรอกอีเมลของคุณเพื่อรับรหัส OTP สำหรับตั้งรหัสใหม่
              </Text>

              <View style={styles.inputWrapper}>
                <Feather
                  name="mail"
                  size={18}
                  color="#94A3B8"
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  style={styles.modalInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="อีเมลของคุณ"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !email.trim() && styles.btnDisabled]}
                onPress={handleSendOTP}
                disabled={loading || !email.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnText}>รับรหัส OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep(1)}
              >
                <Feather name="arrow-left" size={20} color="#1E293B" />
              </TouchableOpacity>
              <Text style={styles.modalHeader}>ตั้งรหัสผ่านใหม่</Text>
              <Text style={styles.modalSubtitle}>
                กรอกรหัส OTP ที่ได้รับ และตั้งรหัสผ่านใหม่ได้เลย
              </Text>

              <View style={styles.inputWrapper}>
                <Feather
                  name="key"
                  size={18}
                  color="#94A3B8"
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  style={styles.modalInput}
                  value={otp}
                  onChangeText={setOtp}
                  placeholder="รหัส OTP" // 🟢 เปลี่ยน placeholder
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={8} // 🟢 ขยายความจุให้พิมพ์ได้ถึง 8 หลัก
                />
              </View>

              <View style={[styles.inputWrapper, { marginTop: 12 }]}>
                <Feather
                  name="lock"
                  size={18}
                  color="#94A3B8"
                  style={{ marginRight: 12 }}
                />
                <TextInput
                  style={styles.modalInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="รหัสผ่านใหม่"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={isSecure}
                />
                <TouchableOpacity
                  onPress={() => setIsSecure(!isSecure)}
                  style={{ padding: 4 }}
                >
                  <Feather
                    name={isSecure ? "eye-off" : "eye"}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!otp.trim() || !newPassword.trim()) && styles.btnDisabled,
                ]}
                onPress={handleVerifyAndReset}
                disabled={loading || !otp.trim() || !newPassword.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnText}>บันทึกรหัสผ่านใหม่</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={handleClose} style={styles.cancelLink}>
            <Text style={styles.cancelLinkText}>ยกเลิก</Text>
          </TouchableOpacity>

          <View style={{ height: Platform.OS === "ios" ? 20 : 0 }} />
        </KeyboardAvoidingView>
      </View>
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
    paddingBottom: 40,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  dragHandle: {
    width: 36,
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: 12,
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
    padding: 8,
    marginLeft: -8,
  },
  modalHeader: {
    fontSize: 22,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: "Prompt_400Regular",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
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
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Prompt_400Regular",
  },
  primaryBtn: {
    backgroundColor: "#10B981",
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  btnDisabled: {
    backgroundColor: "#94A3B8",
  },
  btnText: {
    color: "#FFFFFF",
    fontFamily: "Prompt_600SemiBold",
    fontSize: 16,
  },
  cancelLink: { marginTop: 20 },
  cancelLinkText: {
    textAlign: "center",
    color: "#94A3B8",
    fontFamily: "Prompt_600SemiBold",
  },
});
