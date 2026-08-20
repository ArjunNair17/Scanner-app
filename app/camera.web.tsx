import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "../src/components/Button";
import { CloseX } from "../src/components/CloseX";
import { useApp } from "../src/context/AppContext";
import { SAMPLE_PLATE_URI } from "../src/lib/image-uri";
import { canScan } from "../src/lib/scans";
import { camera as copy } from "../src/strings";
import { colors, type } from "../src/theme";

export default function CameraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const app = useApp();
  const [busy, setBusy] = useState(false);

  const goAnalyze = (uri: string) => {
    router.replace({ pathname: "/analyzing", params: { uri } });
  };

  const gate = () => {
    if (!app.aiConsentAccepted) {
      router.replace("/consent");
      return false;
    }
    if (!canScan(app.isPremium, app.freeScansUsed)) {
      router.replace({ pathname: "/paywall", params: { from: "gate" } });
      return false;
    }
    return true;
  };

  const pick = async () => {
    if (busy || !gate()) return;
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        goAnalyze(result.assets[0].uri);
      }
    } finally {
      setBusy(false);
    }
  };

  const useSample = () => {
    if (busy || !gate()) return;
    goAnalyze(SAMPLE_PLATE_URI);
  };

  return (
    <View style={[styles.black, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <CloseX onPress={() => router.back()} />
      </View>
      <View style={styles.center}>
        <Text style={styles.title}>{copy.webTitle}</Text>
        <Text style={styles.hint}>{copy.webHint}</Text>
        <Button label={copy.library} onPress={() => void pick()} disabled={busy} />
        <Pressable onPress={useSample} disabled={busy} accessibilityRole="button">
          <Text style={styles.sample}>{copy.sample}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  black: { flex: 1, backgroundColor: "#000" },
  top: { paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 16 },
  title: { ...type.h2, color: colors.white, textAlign: "center" },
  hint: { ...type.body, color: "#D1D5DB", textAlign: "center", marginBottom: 8 },
  sample: { ...type.caption, color: colors.white, textAlign: "center", fontWeight: "650" },
});
