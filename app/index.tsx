import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { Button } from "@/components/Button";
import { useRouter, Href } from "expo-router";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens (Emerald Theme) ─────────────────────────────────────────────
const C = {
  primary: "#10B981", // Emerald-500
  primaryLight: "#D1FAE5", // Emerald-100
  bg: "#F9FAFB", // Gray-50
  textHigh: "#111827", // Gray-900
  textMed: "#4B5563", // Gray-600
} as const;

// ─── Animation Hook ────────────────────────────────────────────────────────────
function useFadeSlide(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 40,
        friction: 8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay]);

  return { opacity, transform: [{ translateY }] };
}

export default function IndexScreen() {
  const router = useRouter();

  const contentAnim = useFadeSlide(100);
  const buttonAnim = useFadeSlide(300);

  return (
    <View style={styles.container}>
      {/* ── Background Blobs (วงกลมตกแต่งฉากหลัง) ── */}
      <View style={styles.blob1} pointerEvents="none" />
      <View style={styles.blob2} pointerEvents="none" />
      <View style={styles.blob3} pointerEvents="none" />

      {/* ── ส่วนเนื้อหาหลัก ── */}
      <Animated.View style={[styles.content, contentAnim]}>
        {/* ชื่อแอป */}
        <Text style={styles.title}>FamCart</Text>

        {/* รูปโลโก้ตรงกลาง*/}
        <View style={styles.imageWrapper}>
          <View style={styles.imageGlow} />
          <Image
            source={require("@/assets/images/inventory.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* คำโปรย */}
        <Text style={styles.subtitle}>
          จัดการรายการซื้อของเข้าบ้านง่ายๆ{"\n"}แชร์ร่วมกับครอบครัวได้ทันที
        </Text>
      </Animated.View>

      {/* ปุ่มกดเริ่มใช้งาน */}
      <Animated.View style={[styles.footer, buttonAnim]}>
        <Button
          title="เริ่มต้นใช้งาน"
          onPress={() => router.push("/sign-in" as Href)}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    position: "relative",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: "#A7F3D0", // Emerald-200
    top: -width * 0.2,
    right: -width * 0.2,
    opacity: 0.4,
  },
  blob2: {
    position: "absolute",
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: C.primaryLight,
    bottom: height * 0.1,
    left: -width * 0.2,
    opacity: 0.5,
  },
  blob3: {
    position: "absolute",
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: width * 0.2,
    backgroundColor: "#34D399", // Emerald-400
    top: height * 0.4,
    right: -width * 0.1,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    zIndex: 1,
  },
  title: {
    fontSize: 48,
    fontFamily: "Prompt_700Bold",
    color: C.primary,
    letterSpacing: -1.5,
    marginBottom: 20,
  },
  imageWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  imageGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    backgroundColor: C.primary,
    borderRadius: 70,
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  logo: {
    width: 200,
    height: 200,
    zIndex: 2,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Prompt_400Regular",
    color: C.textMed,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 20,
    zIndex: 1,
  },
});
