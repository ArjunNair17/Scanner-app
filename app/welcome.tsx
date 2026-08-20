import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { welcome } from "../src/strings";
import { colors, radius, space, type } from "../src/theme";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.mark}>
          <Text style={styles.markGlyph}>🍴</Text>
        </View>
        <Text style={styles.h1}>{welcome.h1}</Text>
        <Text style={styles.sub}>{welcome.sub}</Text>
      </View>
      <View style={styles.rows}>
        {welcome.rows.map((row) => (
          <View key={row} style={styles.row}>
            <View style={styles.dot} />
            <Text style={styles.rowText}>{row}</Text>
          </View>
        ))}
      </View>
      <View style={styles.footer}>
        <Button label={welcome.cta} onPress={() => router.push("/quiz")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1, justifyContent: "flex-end", paddingBottom: space.xl, gap: 14 },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  markGlyph: { fontSize: 26 },
  h1: { ...type.h1, color: colors.text },
  sub: { ...type.body, color: colors.muted, fontSize: 18, lineHeight: 26 },
  rows: { gap: 12, marginBottom: space.xl },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  rowText: { ...type.body, color: colors.text, fontWeight: "600" },
  footer: { paddingBottom: space.sm },
});
