import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  Animated,
} from "react-native";
import { Button } from "@/components/Button";
import { Feather } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

export const EditProfileModal = ({
  visible,
  onClose,
  currentUsername,
  onUpdateSuccess,
}: any) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setUsername(currentUsername);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 10,
      }).start();
    } else {
      translateY.setValue(300);
    }
  }, [visible, currentUsername]);

  const isChanged =
    username.trim() !== currentUsername && username.trim().length > 0;

  const handleUpdate = async () => {
    if (!username.trim()) return Alert.alert("แจ้งเตือน", "กรุณาระบุชื่อ");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", user.id);

      if (!error) {
        onUpdateSuccess();
        onClose();
      } else {
        Alert.alert("ผิดพลาด", "ไม่สามารถอัปเดตชื่อได้");
      }
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ตั้งค่าโปรไฟล์</Text>
              <Text style={styles.subtitle}>จัดการข้อมูลส่วนตัวของคุณ</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ชื่อที่แสดง</Text>
            <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
              <Feather
                name="user"
                size={18}
                color={focused ? "#10B981" : "#94A3B8"}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="กรอกชื่อของคุณ"
                placeholderTextColor="#94A3B8"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>
          </View>

          <Button
            title="บันทึกการเปลี่ยนแปลง"
            onPress={handleUpdate}
            loading={loading}
            disabled={!isChanged}
          />

          <View style={styles.divider} />

          <Text style={styles.label}>บัญชีผู้ใช้งาน</Text>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <View style={styles.logoutContent}>
              <View style={styles.logoutIconBg}>
                <Feather name="log-out" size={18} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>ออกจากระบบ</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#FCA5A5" />
          </TouchableOpacity>

          <View style={{ height: Platform.OS === "ios" ? 40 : 20 }} />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -10 },
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  subtitle: {
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
  inputGroup: {
    marginBottom: 24,
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
  inputFocused: {
    borderColor: "#10B981",
    backgroundColor: "#FFFFFF",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    color: "#1E293B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 32,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FEF2F2",
    padding: 12,
    paddingRight: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Prompt_600SemiBold",
    color: "#EF4444",
  },
});
