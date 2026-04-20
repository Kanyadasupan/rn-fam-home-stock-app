import React, { useRef } from "react";
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  Animated,
} from "react-native";

interface InputProps extends TextInputProps {
  label: string;
  rightIcon?: React.ReactNode; // 🟢 เพิ่ม Prop รองรับไอคอนด้านขวา (เช่น ลูกตาเปิด-ปิดรหัส)
}

export const Input = ({ label, rightIcon, ...props }: InputProps) => {
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false, // borderColor ไม่รองรับ Native Driver
    }).start();
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    props.onBlur?.(e);
  };

  // Interpolate สีขอบ: Slate-100 -> Emerald-500
  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F1F5F9", "#10B981"],
  });

  // Interpolate สีพื้นหลัง: Slate-50 -> Pure White
  const backgroundColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F8FAFC", "#FFFFFF"],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            backgroundColor,
            // เพิ่มเงาจางๆ ตอน Focus (iOS)
            shadowOpacity: borderAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.05],
            }),
          },
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor="#94A3B8"
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#10B981" // สี Cursor Emerald
          {...props}
        />
        {/* 🟢 ถ้ามีการส่ง rightIcon มา ให้แสดงตรงนี้ */}
        {rightIcon && (
          <View style={styles.rightIconContainer}>{rightIcon}</View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16, // ปรับให้กระชับเข้ากับดีไซน์ใหม่
  },
  label: {
    fontSize: 12,
    fontFamily: "Prompt_600SemiBold",
    color: "#475569", // Slate-600
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row", // 🟢 เรียงแนวนอนเผื่อมี Icon
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 20,
    overflow: "hidden",
    height: 56, // 🟢 ปรับเป็น 56 ให้เข้ากับปุ่มหลัก
    // Shadow สำหรับ Focus
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1E293B", // Slate-800
    fontFamily: "Prompt_400Regular",
    height: "100%",
  },
  rightIconContainer: {
    paddingRight: 16,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});
