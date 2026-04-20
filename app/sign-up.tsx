import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  ScrollView,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

// ─── Design Tokens ──────────────────────────────────────────
const C = {
  primary: "#10B981",
  primaryLight: "#D1FAE5",
  surface: "#FFFFFF",
  textHigh: "#0F172A",
  textMed: "#64748B",
  textLow: "#94A3B8",
  bg: "#F8FAFC",
} as const;

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const router = useRouter();

  const signUpWithEmail = async () => {
    if (!email || !username || !password) {
      return Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
    }
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      Alert.alert("สมัครสมาชิกล้มเหลว", authError.message);
      setLoading(false);
      return;
    }

    const user = authData.user;

    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: user.id, username }]);

      if (profileError) {
        Alert.alert("สมัครสำเร็จ แต่บันทึกโปรไฟล์ไม่ได้", profileError.message);
        console.error("Profile Insert Error:", profileError);
      } else {
        router.replace("/sign-in");
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.decorCircleTop} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Feather name="arrow-left" size={24} color={C.textHigh} />
              </TouchableOpacity>

              <View style={styles.logoBox}>
                <Feather name="users" size={28} color={C.surface} />
              </View>
              <Text style={styles.greetingText}>เริ่มต้นการใช้งาน 🚀</Text>
              <Text style={styles.titleText}>
                สร้างบัญชี <Text style={styles.titleHighlight}>FamCart</Text>
              </Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputWrapper}>
                <Input
                  label="อีเมล"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  label="ชื่อผู้ใช้"
                  placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.passwordContainer}>
                  <Input
                    label="รหัสผ่าน"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={isSecure}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        activeOpacity={0.7}
                        style={{ padding: 4 }}
                      >
                        <Feather
                          name={isSecure ? "eye-off" : "eye"}
                          size={20}
                          color={C.textLow}
                        />
                      </TouchableOpacity>
                    }
                  />
                </View>
              </View>

              <View style={styles.actionContainer}>
                <Button
                  title="สร้างบัญชีผู้ใช้"
                  onPress={signUpWithEmail}
                  loading={loading}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>มีบัญชีอยู่แล้วใช่ไหม? </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={styles.loginLink}>เข้าสู่ระบบที่นี่</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  decorCircleTop: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: C.primaryLight,
    opacity: 0.4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 40,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 32,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  greetingText: {
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    color: C.textMed,
    marginBottom: 8,
  },
  titleText: {
    fontSize: 32,
    fontFamily: "Prompt_700Bold",
    color: C.textHigh,
    letterSpacing: -0.5,
  },
  titleHighlight: {
    color: C.primary,
  },
  formCard: {
    backgroundColor: C.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  inputWrapper: {
    marginBottom: 12,
  },
  passwordContainer: {
    position: "relative",
  },
  actionContainer: {
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  footerText: {
    fontSize: 15,
    fontFamily: "Prompt_400Regular",
    color: C.textMed,
  },
  loginLink: {
    fontSize: 15,
    fontFamily: "Prompt_700Bold",
    color: C.primary,
  },
});
