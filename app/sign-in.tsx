import React, { useState } from "react";
import {
  StyleSheet,
  Alert,
  Text,
  KeyboardAvoidingView,
  Platform,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useRouter, Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ForgotPasswordModal } from "@/components/ForgotPasswordModal";

const C = {
  primary: "#10B981",
  primaryLight: "#D1FAE5",
  surface: "#FFFFFF",
  textHigh: "#0F172A",
  textMed: "#64748B",
  textLow: "#94A3B8",
  bg: "#F8FAFC",
} as const;

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isSecure, setIsSecure] = useState(true);
  const router = useRouter();

  const signInWithEmail = async () => {
    if (!email || !password)
      return Alert.alert("แจ้งเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) Alert.alert("เข้าสู่ระบบล้มเหลว", error.message);
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
              <View style={styles.logoBox}>
                <Feather name="shopping-bag" size={28} color={C.surface} />
              </View>
              <Text style={styles.greetingText}>ยินดีต้อนรับกลับมา 👋</Text>
              <Text style={styles.titleText}>
                เข้าสู่ระบบ <Text style={styles.titleHighlight}>FamCart</Text>
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

              <TouchableOpacity
                onPress={() => setShowForgotModal(true)}
                style={styles.forgotPasswordBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>
                  ลืมรหัสผ่านใช่ไหม?
                </Text>
              </TouchableOpacity>

              <View style={styles.actionContainer}>
                <Button
                  title="เข้าสู่ระบบ"
                  onPress={signInWithEmail}
                  loading={loading}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>ยังไม่มีบัญชีใช่ไหม? </Text>
              <TouchableOpacity
                onPress={() => router.push("/sign-up" as Href)}
                activeOpacity={0.7}
              >
                <Text style={styles.signUpLink}>สร้างบัญชีใหม่</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ForgotPasswordModal
        visible={showForgotModal}
        onClose={() => setShowForgotModal(false)}
      />
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
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 40,
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: 40,
  },
  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
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
    marginBottom: 16,
  },
  passwordContainer: {
    position: "relative",
  },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
    marginBottom: 28,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: C.primary,
    fontFamily: "Prompt_600SemiBold",
    fontSize: 14,
  },
  actionContainer: {
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    fontSize: 15,
    fontFamily: "Prompt_400Regular",
    color: C.textMed,
  },
  signUpLink: {
    fontSize: 15,
    fontFamily: "Prompt_700Bold",
    color: C.primary,
  },
});
