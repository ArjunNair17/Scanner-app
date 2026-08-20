import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../src/components/Screen";
import { preparing } from "../src/strings";
import { colors, type } from "../src/theme";

export default function PreparingScreen() {
  const router = useRouter();
  const { quiz } = useLocalSearchParams<{ quiz: string }>();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => {
      setIdx((i) => Math.min(i + 1, preparing.lines.length - 1));
    }, 1000);
    const done = setTimeout(() => {
      router.replace({ pathname: "/paywall", params: { quiz: quiz ?? "", from: "onboarding" } });
    }, 3000);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [quiz, router]);

  return (
    <Screen>
      <View style={styles.center}>
        <View style={styles.ring} />
        <Text style={styles.line}>{preparing.lines[idx]}</Text>
      </View>
      <Text style={styles.footer}>{preparing.footer}</Text>
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
  footer: { ...type.caption, color: colors.muted, textAlign: "center", paddingBottom: 8 },
});
