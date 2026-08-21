import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CloseX } from "../src/components/CloseX";
import { useApp } from "../src/context/AppContext";
import { scanEntryRoute } from "../src/lib/scans";
import { camera as copy } from "../src/strings";
import { colors, type } from "../src/theme";

export default function CameraScreen() {
  const router = useRouter();
  const app = useApp();
  const dest = scanEntryRoute({
    aiConsentAccepted: app.aiConsentAccepted,
    isPremium: app.isPremium,
    freeScansUsed: app.freeScansUsed,
  });

  useEffect(() => {
    if (dest === "consent") {
      router.replace("/consent");
      return;
    }
    if (dest === "paywall") {
      router.replace({ pathname: "/paywall", params: { from: "gate" } });
    }
  }, [dest, router]);

  if (dest !== "camera") {
    return <View style={styles.black} />;
  }

  return <CameraCapture />;
}

function CameraCapture() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const app = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [busy, setBusy] = useState(false);

  const goAnalyze = (uri: string) => {
    router.replace({ pathname: "/analyzing", params: { uri } });
  };

  const gate = () => {
    const dest = scanEntryRoute({
      aiConsentAccepted: app.aiConsentAccepted,
      isPremium: app.isPremium,
      freeScansUsed: app.freeScansUsed,
    });
    if (dest === "consent") {
      router.replace("/consent");
      return false;
    }
    if (dest === "paywall") {
      router.replace({ pathname: "/paywall", params: { from: "gate" } });
      return false;
    }
    return true;
  };

  const snap = async () => {
    if (busy || !gate()) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8, skipProcessing: true });
      if (photo?.uri) goAnalyze(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const pick = async () => {
    if (busy || !gate()) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      goAnalyze(result.assets[0].uri);
    }
  };

  if (!permission) {
    return <View style={styles.black} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.black, styles.center, { paddingTop: insets.top }]}>
        <View style={styles.permTop}>
          <CloseX onPress={() => router.back()} />
        </View>
        <Text style={styles.perm}>{copy.permission}</Text>
        <Pressable onPress={() => void requestPermission()} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={() => void pick()}>
          <Text style={styles.library}>{copy.library}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.black}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
      <View style={[styles.overlay, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.top}>
          <CloseX onPress={() => router.back()} />
          <Text style={styles.tip}>{copy.tip}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.bottom}>
          <Pressable onPress={() => void pick()}>
            <Text style={styles.library}>{copy.library}</Text>
          </Pressable>
          <Pressable onPress={() => void snap()} style={styles.shutter} disabled={busy} />
          <View style={{ width: 80 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: "#000" },
  center: { justifyContent: "center", alignItems: "center", padding: 24, gap: 16 },
  overlay: { flex: 1, justifyContent: "space-between" },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 },
  tip: { ...type.caption, color: colors.white, textAlign: "center", flex: 1, paddingHorizontal: 8 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    borderWidth: 6,
    borderColor: colors.accent,
  },
  library: { ...type.caption, color: colors.white, width: 80, fontWeight: "650" },
  perm: { ...type.body, color: colors.white, textAlign: "center" },
  permTop: { position: "absolute", top: 56, left: 16 },
  permBtn: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14 },
  permBtnText: { color: colors.white, fontWeight: "700" },
});
