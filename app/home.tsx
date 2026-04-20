import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import { EmptyStateView } from "@/components/EmptyStateView";
import { CreateFamilyModal } from "@/components/CreateFamilyModal";
import { JoinFamilyModal } from "@/components/JoinFamilyModal";

const { width } = Dimensions.get("window");

const C = {
  primary: "#10B981",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  textHigh: "#1E293B",
  textMed: "#64748B",
  accent: "#F0FDF4",
} as const;

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [families, setFamilies] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchData();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    },[fadeAnim] ),
  );

  const fetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: memberships } = await supabase
      .from("family_members")
      .select("family_id, families(*)")
      .eq("user_id", user.id);

    if (memberships) {
      setFamilies(
        memberships.map((m: any) => m.families).filter((f) => f !== null),
      );
    }
    setLoading(false);
  };

  const handleCreateFamily = async (name: string) => {
    setModalLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date().toISOString();

    const { data: newFam, error } = await supabase
      .from("families")
      .insert([
        {
          name,
          join_code: joinCode,
          created_by: user?.id,
          created_at: now,
        },
      ])
      .select()
      .single();

    if (error) {
      Alert.alert("สร้างกลุ่มไม่สำเร็จ", error.message);
      setModalLoading(false);
      return;
    }

    if (newFam) {
      const { error: memberError } = await supabase
        .from("family_members")
        .insert([{ family_id: newFam.id, user_id: user?.id, role: "admin" }]);

      if (memberError) {
        Alert.alert("ข้อผิดพลาด", memberError.message);
      } else {
        setShowCreateModal(false);
        fetchData();
        router.push({
          pathname: "/family/[id]",
          params: { id: newFam.id },
        });
      }
    }
    setModalLoading(false);
  };

  const handleJoinFamily = async (code: string) => {
    setModalLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: targetFam } = await supabase
      .from("families")
      .select("id")
      .eq("join_code", code.trim().toUpperCase())
      .maybeSingle();

    if (!targetFam) {
      setModalLoading(false);
      return Alert.alert(
        "ไม่พบรหัส",
        "ไม่พบรหัสที่กรอก กรุณาตรวจสอบรหัสกลุ่มของคุณอีกครั้ง",
        [{ text: "ตกลง" }],
      );
    }

    const { data: existingMember } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", targetFam.id)
      .eq("user_id", user?.id)
      .maybeSingle();

    if (existingMember) {
      setModalLoading(false);
      return Alert.alert("ขออภัย", "คุณเป็นสมาชิกของกลุ่มนี้อยู่แล้ว");
    }

    const { error: joinError } = await supabase
      .from("family_members")
      .insert([{ family_id: targetFam.id, user_id: user?.id, role: "member" }]);

    if (!joinError) {
      setShowJoinModal(false);
      fetchData();
    } else {
      Alert.alert("ผิดพลาด", "ไม่สามารถเข้าร่วมกลุ่มได้");
    }
    setModalLoading(false);
  };

  if (loading && families.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topNav}>
          <View>
            <Text style={styles.greetingText}>ยินดีต้อนรับ 👋</Text>
            <Text style={styles.brandTitle}>Shopping family</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {families.length === 0 ? (
            <EmptyStateView />
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={styles.sectionLabel}>
                กลุ่มของคุณ ({families.length})
              </Text>

              {families.map((fam, index) => (
                <TouchableOpacity
                  key={fam.id}
                  activeOpacity={0.9}
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push({
                      pathname: "/family/[id]",
                      params: { id: fam.id },
                    });
                  }}
                  style={styles.cardWrapper}
                >
                  <LinearGradient
                    colors={
                      index === 0
                        ? ["#FFFFFF", "#F0FDF4"]
                        : ["#FFFFFF", "#FFFFFF"]
                    }
                    style={styles.familyCard}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.homeIconBox}>
                        <Feather name="home" size={22} color={C.primary} />
                      </View>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeText}>{fam.join_code}</Text>
                      </View>
                    </View>

                    <View style={styles.cardBody}>
                      <Text style={styles.familyName} numberOfLines={1}>
                        {fam.name}
                      </Text>
                      <Text style={styles.cardSubtitle}>
                        แตะเพื่อจัดการรายการสินค้า
                      </Text>
                    </View>

                    <View style={styles.arrowCircle}>
                      <Feather
                        name="chevron-right"
                        size={18}
                        color={C.primary}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      <View style={styles.dockContainer}>
        <View style={styles.dock}>
          <TouchableOpacity
            style={styles.dockBtnPrimary}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowCreateModal(true);
            }}
          >
            <Feather name="plus" size={18} color="#FFF" />
            <Text style={styles.dockBtnTextPrimary}>สร้างกลุ่ม</Text>
          </TouchableOpacity>

          <View style={styles.dockDivider} />

          <TouchableOpacity
            style={styles.dockBtnSecondary}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowJoinModal(true);
            }}
          >
            <Feather name="users" size={18} color={C.textMed} />
            <Text style={styles.dockBtnTextSecondary}>เข้าร่วมกลุ่ม</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CreateFamilyModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateFamily}
        loading={modalLoading}
      />
      <JoinFamilyModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSubmit={handleJoinFamily}
        loading={modalLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topNav: { paddingHorizontal: 24, paddingTop: 20, marginBottom: 20 },
  greetingText: {
    fontSize: 14,
    fontFamily: "Prompt_400Regular",
    color: C.textMed,
  },
  brandTitle: { fontSize: 32, fontFamily: "Prompt_700Bold", color: C.textHigh },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 140 },
  sectionLabel: {
    fontSize: 13,
    fontFamily: "Prompt_600SemiBold",
    color: C.textMed,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardWrapper: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  familyCard: {
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#FFF",
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  homeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: C.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  codeBadge: {
    backgroundColor: C.textHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  codeText: { color: "#FFF", fontSize: 12, fontFamily: "Prompt_700Bold" },
  cardBody: { marginBottom: 4 },
  familyName: { fontSize: 22, fontFamily: "Prompt_700Bold", color: C.textHigh },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: "Prompt_400Regular",
    color: C.textMed,
  },
  arrowCircle: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  dockContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  dock: {
    flexDirection: "row",
    backgroundColor: "#1E293B",
    padding: 8,
    borderRadius: 32,
    width: width * 0.9,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  dockBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: C.primary,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  dockBtnTextPrimary: {
    color: "#FFF",
    fontFamily: "Prompt_700Bold",
    fontSize: 15,
  },
  dockDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 10,
  },
  dockBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    height: 52,
  },
  dockBtnTextSecondary: {
    color: "#94A3B8",
    fontFamily: "Prompt_600SemiBold",
    fontSize: 15,
  },
});
