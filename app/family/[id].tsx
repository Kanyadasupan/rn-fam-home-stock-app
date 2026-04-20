import { supabase } from "@/lib/supabase";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  StatusBar,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import { Feather } from "@expo/vector-icons";

// นำเข้า Components ที่เราปรับแต่งเป็นแนว Modern Minimalist Glass แล้ว
import { FamilyHeader } from "@/components/FamilyHeader";
import { MemberList } from "@/components/MemberList";
import { ShoppingList } from "@/components/ShoppingList";

// ─── Design Tokens (Modern Slate & Emerald) ──────────────────────────────────
const C = {
  primary: "#10B981", // Emerald-500
  danger: "#EF4444", // Red-500 สำหรับปุ่มลบ/ออก
  bg: "#F8FAFC", // Slate-50 (พรีเมียมมินิมอล)
  textHigh: "#1E293B", // Slate-800
  textMed: "#64748B", // Slate-500
} as const;

export default function FamilyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 🟢 ตรวจสอบสถานะว่าเป็นคนสร้างครอบครัว (Owner) หรือไม่
  const isOwner = family?.created_by === currentUserId;

  // 1. ดึงข้อมูล User ปัจจุบัน
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  // 2. ดึงข้อมูลครั้งแรกเมื่อหน้าจอโหลด
  useEffect(() => {
    if (id) fetchFamilyData();
  }, [id]);

  // 3. เพิ่มระบบ Realtime เพื่อฟังการเปลี่ยนแปลงของกลุ่มและสมาชิก
  useEffect(() => {
    if (!id) return;

    // สร้าง Channel เพื่อฟังเสียงจาก Database
    const channel = supabase
      .channel(`family-realtime-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "families",
          filter: `id=eq.${id}`,
        },
        () => fetchFamilyData(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "family_members",
          filter: `family_id=eq.${id}`,
        },
        () => fetchFamilyData(),
      )
      .subscribe();

    // ยกเลิกการฟังเมื่อปิดหน้านี้
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchFamilyData = async () => {
    try {
      // 1. ดึงข้อมูลครอบครัว
      const { data: famData, error: famError } = await supabase
        .from("families")
        .select("*")
        .eq("id", id)
        .single();

      if (famError) throw famError;
      if (famData) setFamily(famData);

      // 2. ดึงข้อมูลสมาชิก
      const { data: memData, error: memError } = await supabase
        .from("family_members")
        .select(
          `
          id, 
          role, 
          user_id,
          profiles:user_id (username)
        `,
        )
        .eq("family_id", id);

      if (memError) throw memError;
      if (memData) setMembers(memData);
    } catch (error) {
      console.error("Error fetching family data:", error);
      // ถ้าข้อมูลครอบครัวหายไป (เช่น ถูกลบโดยเครื่องอื่น) ให้เด้งกลับหน้าหลัก
      router.replace("/home");
    } finally {
      setLoading(false);
    }
  };

  // 🔴 ฟังก์ชัน: ลบครอบครัว (เฉพาะคนสร้างเท่านั้น)
  const handleDeleteFamily = async () => {
    Alert.alert(
      "ยืนยันการลบครอบครัว",
      "ข้อมูลรายการสินค้า สมาชิก และรูปภาพทั้งหมดจะถูกลบถาวร ไม่สามารถกู้คืนได้",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบทันที",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              // 1. ดึงข้อมูลรูปภาพจากตาราง items ออกมาก่อน
              const { data: familyItems } = await supabase
                .from("items")
                .select("image_url")
                .eq("family_id", id);

              // 🟢 แปลง URL เต็มให้เหลือแค่ "ชื่อไฟล์" เพื่อให้ Supabase ลบได้ถูกต้อง
              const imagePaths = familyItems
                ?.map((item) => {
                  const url = item.image_url;
                  if (!url) return null;

                  // หาคำว่า "shopping-items/" แล้วตัดเอาเฉพาะสิ่งที่อยู่ข้างหลังมา
                  const bucketString = "shopping-items/";
                  if (url.includes(bucketString)) {
                    return url.split(bucketString)[1];
                  }
                  return url; // ถ้าเป็นชื่อไฟล์อยู่แล้วก็ส่งไปเลย
                })
                .filter((path) => path != null) as string[];

              // 2. ลบรูปใน Storage ทิ้งทั้งหมด (ถ้ามี)
              if (imagePaths && imagePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                  .from("shopping-items")
                  .remove(imagePaths);

                if (storageError) {
                  console.error("ลบรูปใน Storage ไม่สำเร็จ:", storageError);
                }
              }

              // 3. ลบครอบครัวออกจาก DB (CASCADE จะลบข้อมูลตารางอื่นๆ ให้เอง)
              const { error } = await supabase
                .from("families")
                .delete()
                .eq("id", id);
              if (error) throw error;

              router.replace("/home");
            } catch (error: any) {
              Alert.alert("เกิดข้อผิดพลาด", error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // 🚪 ฟังก์ชัน: ออกจากครอบครัว (สำหรับสมาชิกทั่วไป)
  const handleLeaveFamily = async () => {
    Alert.alert(
      "ยืนยันการออกจากครอบครัว",
      "คุณต้องการออกจากครอบครัวนี้ใช่หรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ยืนยัน",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase
                .from("family_members")
                .delete()
                .eq("family_id", id)
                .eq("user_id", currentUserId);

              if (error) throw error;
              router.replace("/home");
            } catch (error: any) {
              Alert.alert("เกิดข้อผิดพลาด", error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  // ─── Loading State ───
  if (loading || !family) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <Stack.Screen
          options={{
            title: "",
            headerShadowVisible: false,
            headerStyle: { backgroundColor: C.bg },
          }}
        />
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* 🚀 ปรับแต่ง Navigation Header ให้เข้าเซต Glassmorphism */}
      <Stack.Screen
        options={{
          title: family.name,
          headerTitleStyle: {
            fontFamily: "Prompt_600SemiBold",
            fontSize: 17,
            color: C.textHigh,
          },
          headerStyle: { backgroundColor: C.bg },
          headerShadowVisible: false,
          headerTintColor: C.textHigh,
          headerBackTitle: "",
          headerBackVisible: true,
          // 🔴 ปุ่มมุมขวาบน (ลบ/ออก)
          headerRight: () => (
            <TouchableOpacity
              onPress={isOwner ? handleDeleteFamily : handleLeaveFamily}
              style={styles.headerActionBtn}
            >
              <Feather
                name={isOwner ? "trash-2" : "log-out"}
                size={20}
                color={C.danger}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ส่วนหัว: การ์ดชื่อครอบครัวและรหัสเชิญ */}
        <FamilyHeader family={family} />

        {/* รายชื่อสมาชิก: แสดงแบบการ์ดซ้อนการ์ด */}
        <MemberList members={members} />

        {/* รายการช้อปปิ้ง: ส่วนจัดเก็บสินค้า */}
        <ShoppingList familyId={family.id} />

        {/* 🔴 ปุ่มใหญ่ด้านล่างสุด (ลบ/ออก) เพื่อให้กดย้ายได้ง่าย */}
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={isOwner ? handleDeleteFamily : handleLeaveFamily}
        >
          <Feather
            name={isOwner ? "trash-2" : "log-out"}
            size={18}
            color={C.danger}
          />
          <Text style={styles.dangerButtonText}>
            {isOwner ? "ลบครอบครัวนี้" : "ออกจากครอบครัว"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bg,
  },
  headerActionBtn: {
    padding: 8,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.danger,
    borderStyle: "dashed",
    backgroundColor: "#FEF2F2", // พื้นหลังแดงอ่อนๆ
    gap: 8,
  },
  dangerButtonText: {
    fontFamily: "Prompt_600SemiBold",
    fontSize: 15,
    color: C.danger,
  },
});
