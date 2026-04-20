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
import { FamilyHeader } from "@/components/FamilyHeader";
import { MemberList } from "@/components/MemberList";
import { ShoppingList } from "@/components/ShoppingList";

// ─── Design Tokens (Modern Slate & Emerald) ──────────────────────────────────
const C = {
  primary: "#10B981",
  danger: "#EF4444",
  bg: "#F8FAFC",
  textHigh: "#1E293B",
  textMed: "#64748B",
} as const;

export default function FamilyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const isOwner = family?.created_by === currentUserId;

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (id) fetchFamilyData();
  }, [id]);

  useEffect(() => {
    if (!id) return;

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const fetchFamilyData = async () => {
    try {
      const { data: famData, error: famError } = await supabase
        .from("families")
        .select("*")
        .eq("id", id)
        .single();

      if (famError) throw famError;
      if (famData) setFamily(famData);

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
      router.replace("/home");
    } finally {
      setLoading(false);
    }
  };

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
              const { data: familyItems } = await supabase
                .from("items")
                .select("image_url")
                .eq("family_id", id);

              const imagePaths = familyItems
                ?.map((item) => {
                  const url = item.image_url;
                  if (!url) return null;

                  const bucketString = "shopping-items/";
                  if (url.includes(bucketString)) {
                    return url.split(bucketString)[1];
                  }
                  return url;
                })
                .filter((path) => path != null) as string[];

              if (imagePaths && imagePaths.length > 0) {
                const { error: storageError } = await supabase.storage
                  .from("shopping-items")
                  .remove(imagePaths);

                if (storageError) {
                  console.error("ลบรูปใน Storage ไม่สำเร็จ:", storageError);
                }
              }

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
        {/* ส่วนหัว */}
        <FamilyHeader family={family} />

        {/* รายชื่อสมาชิก */}
        <MemberList members={members} />

        {/* รายการช้อปปิ้ง */}
        <ShoppingList familyId={family.id} />

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
    backgroundColor: "#FEF2F2",
    gap: 8,
  },
  dangerButtonText: {
    fontFamily: "Prompt_600SemiBold",
    fontSize: 15,
    color: C.danger,
  },
});
