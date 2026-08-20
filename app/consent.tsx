import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { CloseX } from "../src/components/CloseX";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/context/AppContext";
import { canScan } from "../src/lib/scans";
import { consent } from "../src/strings";
import { colors, type } from "../src/theme";

export default function ConsentScreen() {
  const router = useRouter();
  const app = useApp();

  const accept = async () => {
    await app.acceptConsent();
    if (!canScan(app.isPremium, app.freeScansUsed)) {
      router.replace({ pathname: "/paywall", params: { from: "gate" } });
      return;
    }
    router.replace("/camera");
  };

  return (
    <Screen>
      <View style={styles.top}>
        <CloseX onPress={() => router.back()} />
      </View>
      <View style={styles.body}>
        <Text style={styles.h1}>{consent.title}</Text>
        <Text style={styles.copy}>{consent.body}</Text>
      </View>
      <Button label={consent.accept} onPress={() => void accept()} />
      <Button label={consent.decline} variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: 12 },
  body: { flex: 1, justifyContent: "center", gap: 16 },
  h1: { ...type.h1, color: colors.text },
  copy: { ...type.body, color: colors.muted, fontSize: 18, lineHeight: 26 },
});
