import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { supabase } from "@/lib/supabase";
import { ShoppingItemRow } from "./ShoppingItemRow";
import { ShoppingItemFormModal } from "./ShoppingItemFormModal";
import { SessionCard } from "@/components/SessionCard";
import { ListEmptyState } from "@/components/ListEmptyState";
import { TripSummaryFooter } from "@/components/TripSummaryFooter";
import { CreateSessionModal } from "@/components/CreateSessionModal";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";
import * as Haptics from "expo-haptics";

export const ShoppingList = ({ familyId }: { familyId: string }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [uniqueNames, setUniqueNames] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "1",
    unit: "",
    price: "0",
    imageUri: null as string | null,
  });

  useEffect(() => {
    if (familyId && !currentSession) {
      fetchSessions();
      const sessionSub = supabase
        .channel("public:shopping_sessions")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_sessions",
            filter: `family_id=eq.${familyId}`,
          },
          fetchSessions,
        )
        .subscribe();
      return () => {
        supabase.removeChannel(sessionSub);
      };
    }
  }, [familyId, currentSession]);

  useEffect(() => {
    if (currentSession) {
      silentFetchItems();
      const itemSub = supabase
        .channel("public:items")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "items",
            filter: `session_id=eq.${currentSession.id}`,
          },
          silentFetchItems,
        )
        .subscribe();
      return () => {
        supabase.removeChannel(itemSub);
      };
    }
  }, [currentSession]);

  const fetchSessions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("shopping_sessions")
      .select("*")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false });
    if (data) setSessions(data);
    setLoading(false);
  };

  const handleCreateSession = async (sessionName: string) => {
    if (!sessionName.trim()) return;
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await supabase
      .from("shopping_sessions")
      .insert([{ family_id: familyId, name: sessionName.trim() }]);
    setSessionModalVisible(false);
    fetchSessions();
  };

  const deleteSession = async (id: string) => {
    Alert.alert(
      "ยืนยันการลบ",
      "ทริปและรายการทั้งหมดในนี้จะหายไป ต้องการลบหรือไม่?",
      [
        { text: "ยกเลิก", style: "cancel" },
        {
          text: "ลบเลย",
          style: "destructive",
          onPress: async () => {
            const { data: sessionItems } = await supabase
              .from("items")
              .select("image_url")
              .eq("session_id", id);

            if (sessionItems && sessionItems.length > 0) {
              const fileNames = sessionItems
                .map((i) => i.image_url?.split("/").pop())
                .filter(Boolean) as string[];

              if (fileNames.length > 0) {
                await supabase.storage.from("shopping-items").remove(fileNames);
              }
            }

            await supabase.from("shopping_sessions").delete().eq("id", id);
            fetchSessions();
          },
        },
      ],
    );
  };

  const silentFetchItems = async () => {
    if (!currentSession) return;
    const { data: itemList } = await supabase
      .from("items")
      .select("*, profiles(username)")
      .eq("session_id", currentSession.id)
      .order("created_at", { ascending: false });

    if (itemList) {
      const { data: history } = await supabase
        .from("price_history")
        .select("family_id, item_name, price, recorded_at")
        .eq("family_id", familyId)
        .order("recorded_at", { ascending: false });

      if (history)
        setUniqueNames(Array.from(new Set(history.map((h) => h.item_name))));

      const itemsWithComparison = itemList.map((item) => {
        const prevRecord = history?.find((h) => {
          const recordTime = h.recorded_at || "";
          const itemTime = item.created_at || new Date().toISOString();
          return h.item_name === item.name && recordTime < itemTime;
        });
        return { ...item, lastPrice: prevRecord ? prevRecord.price : null };
      });
      setItems(itemsWithComparison);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      const fileName = `item_${Date.now()}.jpg`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      const { data, error } = await supabase.storage
        .from("shopping-items")
        .upload(fileName, decode(base64), { contentType: "image/jpeg" });

      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("shopping-items").getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  };

  const deleteImageFromStorage = async (imageUrl: string | null) => {
    if (!imageUrl) return;
    try {
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        const { error } = await supabase.storage
          .from("shopping-items")
          .remove([fileName]);
        if (error) console.error("Error deleting image:", error);
      }
    } catch (error) {
      console.error("Delete image storage error:", error);
    }
  };

  const openAddModal = () => {
    setEditingItemId(null);
    setFormData({
      name: "",
      category: "",
      quantity: "1",
      unit: "",
      price: "0",
      imageUri: null,
    });
    setModalVisible(true);
  };

  const openEditModal = (item: any) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name,
      category: item.category || "",
      quantity: item.quantity.toString(),
      unit: item.unit || "",
      price: item.price.toString(),
      imageUri: item.image_url || null,
    });
    setModalVisible(true);
  };

  const toggleItem = async (item: any) => {
    const newStatus = !item.is_bought;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_bought: newStatus } : i)),
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from("items")
      .update({ is_bought: newStatus, bought_by: newStatus ? user?.id : null })
      .eq("id", item.id);

    if (newStatus) {
      await supabase.from("price_history").insert([
        {
          family_id: familyId,
          item_name: item.name,
          price: Number(item.price) || 0,
          recorded_at: new Date().toISOString(),
        },
      ]);
    } else {
      await supabase
        .from("price_history")
        .delete()
        .eq("family_id", familyId)
        .eq("item_name", item.name)
        .eq("price", Number(item.price) || 0);
    }
    silentFetchItems();
  };

  const deleteItem = async (item: any) => {
    Alert.alert("ยืนยันการลบ", "ต้องการลบรายการนี้ใช่หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบเลย",
        style: "destructive",
        onPress: async () => {
          setItems(items.filter((i) => i.id !== item.id));

          if (item.image_url) {
            await deleteImageFromStorage(item.image_url);
          }

          await supabase.from("items").delete().eq("id", item.id);

          await supabase
            .from("price_history")
            .delete()
            .eq("family_id", familyId)
            .eq("item_name", item.name)
            .eq("price", Number(item.price) || 0);

          silentFetchItems();
        },
      },
    ]);
  };

  const saveItem = async () => {
    if (!formData.name.trim())
      return Alert.alert("แจ้งเตือน", "กรุณาระบุชื่อสินค้า");
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let imageUrl = formData.imageUri;
    let oldItem = editingItemId
      ? items.find((i) => i.id === editingItemId)
      : null;
    let isNewImageUploaded = false;

    if (
      formData.imageUri &&
      (formData.imageUri.startsWith("file://") ||
        formData.imageUri.startsWith("ph://"))
    ) {
      const uploadedUrl = await uploadImage(formData.imageUri);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        isNewImageUploaded = true;
      }
    }

    if (oldItem && oldItem.image_url) {
      if (isNewImageUploaded || formData.imageUri === null) {
        await deleteImageFromStorage(oldItem.image_url);
      }
    }

    const payload = {
      family_id: familyId,
      session_id: currentSession.id,
      name: formData.name.trim(),
      category: formData.category,
      quantity: Number(formData.quantity) || 1,
      unit: formData.unit,
      price: Number(formData.price) || 0,
      image_url: imageUrl,
    };

    if (editingItemId)
      await supabase.from("items").update(payload).eq("id", editingItemId);
    else
      await supabase.from("items").insert([{ ...payload, added_by: user?.id }]);

    setModalVisible(false);
    setLoading(false);
    silentFetchItems();
  };

  // ─── Render: หน้าเลือกรอบการซื้อของ ───
  if (!currentSession) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <View style={styles.iconBox}>
              <Feather name="shopping-bag" size={18} color="#10B981" />
            </View>
            <Text style={styles.header}>ทริปซื้อของ</Text>
          </View>
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSessionModalVisible(true);
            }}
          >
            <Feather
              name="plus"
              size={16}
              color="#FFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.addNewButtonText}>สร้างทริป</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#10B981"
            style={{ marginVertical: 40 }}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          >
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onPress={setCurrentSession}
                  onDelete={deleteSession}
                />
              ))
            ) : (
              <ListEmptyState
                iconName="package"
                message={`ยังไม่มีทริปซื้อของ\nกดปุ่มเพื่อเริ่มสร้างทริปแรก`}
              />
            )}
          </ScrollView>
        )}

        <CreateSessionModal
          visible={sessionModalVisible}
          onClose={() => setSessionModalVisible(false)}
          onSubmit={handleCreateSession}
          loading={loading}
        />
      </View>
    );
  }

  // ─── Render: หน้าจัดการสินค้าในทริป ───
  const totalSpent = items
    .filter((i) => i.is_bought)
    .reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 1),
      0,
    );
  const boughtCount = items.filter((i) => i.is_bought).length;

  return (
    <View style={styles.container}>
      <View style={[styles.headerRow, { gap: 12 }]}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentSession(null);
            setItems([]);
          }}
          style={styles.backBtn}
        >
          <Feather name="arrow-left" size={20} color="#64748B" />
        </TouchableOpacity>
        <Text style={[styles.header, { flex: 1 }]} numberOfLines={1}>
          {currentSession.name}
        </Text>
        <TouchableOpacity style={styles.addNewButton} onPress={openAddModal}>
          <Text style={styles.addNewButtonText}>+ เพิ่มของ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ maxHeight: 500 }}
        showsVerticalScrollIndicator={false}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              onToggle={toggleItem}
              onEdit={openEditModal}
              onDelete={deleteItem}
            />
          ))
        ) : (
          <ListEmptyState
            iconName="list"
            message="ทริปนี้ยังไม่มีรายการสินค้า"
          />
        )}
      </ScrollView>

      {items.length > 0 && (
        <TripSummaryFooter
          totalSpent={totalSpent}
          boughtCount={boughtCount}
          totalCount={items.length}
        />
      )}

      <ShoppingItemFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={saveItem}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingItemId}
        loading={loading}
        uniqueNames={uniqueNames}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 30,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#1E293B",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  titleWithIcon: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
  },
  header: { fontSize: 20, fontFamily: "Prompt_700Bold", color: "#1E293B" },
  backBtn: {
    backgroundColor: "#F8FAFC",
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  addNewButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  addNewButtonText: {
    color: "#FFF",
    fontFamily: "Prompt_700Bold",
    fontSize: 14,
  },
});
