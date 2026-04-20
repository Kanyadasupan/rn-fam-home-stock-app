import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export const EmptyStateView = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={["#F8FAFC", "#FFFFFF"]} style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          <View style={styles.blob} />
          <View style={styles.iconCircle}>
            <Feather name="shopping-bag" size={48} color="#10B981" />
          </View>
        </View>

        <Text style={styles.welcomeText}>เริ่มต้นใช้งาน</Text>
        <Text style={styles.emptySubtitle}>
          จัดการของกินของใช้ในบ้านได้ง่ายกว่าที่เคย{"\n"}
          สร้างกลุ่มเพื่อเริ่มจดรายการร่วมกันวันนี้
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    borderRadius: 32,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  iconWrapper: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  blob: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#D1FAE5",
    opacity: 0.5,
    transform: [{ scale: 1.2 }],
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#10B981",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: "Prompt_700Bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Prompt_400Regular",
  },
});
