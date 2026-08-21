import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { CloseX } from "../src/components/CloseX";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/context/AppContext";
import { scanEntryRoute } from "../src/lib/scans";
import { consent } from "../src/strings";
import { colors, type } from "../src/theme";

export default function ConsentScreen() {
  const router = useRouter();
  const app = useApp();

  const backToToday = () => {
    router.replace("/(tabs)/today");
  };

  const accept = async () => {
    await app.acceptConsent();
    const dest = scanEntryRoute({
      aiConsentAccepted: true,
      isPremium: app.isPremium,
      freeScansUsed: app.freeScansUsed,
    });
    if (dest === "paywall") {
      router.replace({ pathname: "/paywall", params: { from: "gate" } });
      return;
    }
    router.replace("/camera");
  };

  return (
    <Screen>
      <View style={styles.top}>
        <CloseX onPress={backToToday} />
      </View>
      <View style={styles.body}>
        <Text style={styles.h1}>{consent.title}</Text>
        <Text style={styles.copy}>{consent.body}</Text>
      </View>
      <Button label={consent.accept} onPress={() => void accept()} />
      <Button label={consent.decline} variant="ghost" onPress={backToToday} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { marginBottom: 12 },
  body: { flex: 1, justifyContent: "center", gap: 16 },
  h1: { ...type.h1, color: colors.text },
  copy: { ...type.body, color: colors.muted, fontSize: 18, lineHeight: 26 },
});
