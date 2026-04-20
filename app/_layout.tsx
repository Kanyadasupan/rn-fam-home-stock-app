import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, Href } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Prompt_400Regular,
  Prompt_700Bold,
  Prompt_600SemiBold,
} from "@expo-google-fonts/prompt";
import { TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { EditProfileModal } from "@/components/EditProfileModal";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");

  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Prompt_400Regular,
    Prompt_600SemiBold,
    Prompt_700Bold,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthInitialized(true);
      if (session) fetchProfile(session.user.id);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) fetchProfile(session.user.id);
      },
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single();
    if (data) setCurrentUsername(data.username);
  };

  useEffect(() => {
    if (fontsLoaded && isAuthInitialized) SplashScreen.hideAsync();
  }, [fontsLoaded, isAuthInitialized]);

  useEffect(() => {
    if (!isAuthInitialized || !fontsLoaded) return;
    const currentSegment = segments[0] as string | undefined;
    const isPublicRoute =
      currentSegment === undefined ||
      currentSegment === "sign-in" ||
      currentSegment === "sign-up";

    if (!session && !isPublicRoute) router.replace("/" as Href);
    else if (session && isPublicRoute) router.replace("/home" as Href);
  }, [session, isAuthInitialized, fontsLoaded, segments]);

  if (!fontsLoaded || !isAuthInitialized) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false }} />
        <Stack.Screen
          name="home"
          options={{
            title: "FamCart",
            headerTitleStyle: {
              fontFamily: "Prompt_700Bold",
              color: "#111827",
              fontSize: 20,
            },
            headerStyle: { backgroundColor: "#F9FAFB" },
            headerShadowVisible: false,
            headerBackVisible: false,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => setShowEditProfile(true)}
                style={{ padding: 8 }}
                activeOpacity={0.7}
              >
                <Feather name="user" size={24} color="#10B981" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="family/[id]"
          options={{ headerTitleStyle: { fontFamily: "Prompt_700Bold" } }}
        />
      </Stack>

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentUsername={currentUsername}
        onUpdateSuccess={() => session && fetchProfile(session.user.id)}
      />
    </>
  );
}
