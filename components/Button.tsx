import React, { useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  type?: "primary" | "outline" | "ghost"; // เพิ่ม ghost สำหรับปุ่มทางเลือก
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  loading,
  type = "primary",
  disabled,
}: ButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96, // ยุบตัวลงเล็กน้อยพองาม
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={type === "primary" ? "#FFF" : "#10B981"}
          size="small"
        />
      );
    }
    return (
      <Text
        style={[
          styles.text,
          type === "primary" ? styles.textPrimary : styles.textOutline,
        ]}
      >
        {title}
      </Text>
    );
  };

  return (
    <Animated.View style={{ transform: [{ scale }], opacity, width: "100%" }}>
      <TouchableOpacity
        activeOpacity={1} // ใช้ Animation คุมเอง
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={loading || disabled}
      >
        {type === "primary" ? (
          <LinearGradient
            colors={["#10B981", "#059669"]} // Emerald Gradient ที่ลึกขึ้น
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.button,
              styles.primaryShadow,
              disabled && styles.disabled,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.button,
              styles.outline,
              disabled && styles.disabledOutline,
            ]}
          >
            {renderContent()}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 56, // ความสูงมาตรฐานเพื่อให้เข้ากับ UI อื่นๆ
    borderRadius: 24, // โค้งมนเท่ากับการ์ดในหน้า Home
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },

  primaryShadow: {
    // เงาแบบ Soft Slate ผสม Emerald เล็กน้อย
    shadowColor: "#065F46",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },

  outline: {
    backgroundColor: "#FFFFFF", // พื้นหลังขาวสะอาด
    borderWidth: 1.5,
    borderColor: "#F1F5F9", // ขอบ Slate อ่อนๆ ให้ความรู้สึก Glass
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  disabled: {
    opacity: 0.5,
  },

  disabledOutline: {
    borderColor: "#F1F5F9",
    opacity: 0.4,
  },

  text: {
    fontSize: 16,
    fontFamily: "Prompt_600SemiBold", // ใช้ SemiBold เพื่อความสบายตา
    letterSpacing: 0.2,
  },

  textPrimary: {
    color: "#FFFFFF",
  },

  textOutline: {
    color: "#10B981", // ตัวหนังสือเขียว Emerald สำหรับปุ่มรอง
  },
});
