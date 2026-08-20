import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/context/AppContext";
import { scanPlate } from "../src/lib/api";
import { discardPhotos, resizeForScan } from "../src/lib/image";
import { analyzing, errors } from "../src/strings";
import { colors, type } from "../src/theme";

export default function AnalyzingScreen() {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const app = useApp();
  const [idx, setIdx] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    const tick = setInterval(() => {
      setIdx((i) => Math.min(i + 1, analyzing.lines.length - 1));
    }, 900);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      if (!uri) {
        router.replace("/camera");
        return;
      }
      let resized: string | null = null;
      try {
        resized = await resizeForScan(uri);
        const result = await scanPlate(resized, app.deviceId);
        await discardPhotos([uri, resized]);
        if (!result.ok) {
          router.replace({
            pathname: "/result",
            params: { error: result.code, message: errors[result.code] ?? errors.upstream },
          });
          return;
        }
        if (!result.food.identified) {
          router.replace({
            pathname: "/result",
            params: { food: JSON.stringify(result.food) },
          });
          return;
        }
        if (!app.isPremium) {
          await app.consumeIdentifiedScan();
        }
        router.replace({
          pathname: "/result",
          params: { food: JSON.stringify(result.food) },
        });
      } catch {
        await discardPhotos([uri, resized]);
        router.replace({
          pathname: "/result",
          params: { error: "upstream", message: errors.upstream },
        });
      }
    })();
  }, [app, router, uri]);

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.ring} />
        <Text style={styles.line}>{analyzing.lines[idx]}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 22 },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: colors.accent,
    borderTopColor: colors.line,
  },
  line: { ...type.h2, color: colors.text, textAlign: "center" },
});
