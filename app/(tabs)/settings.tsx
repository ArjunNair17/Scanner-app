import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../../src/components/Button";
import { Screen } from "../../src/components/Screen";
import { useApp } from "../../src/context/AppContext";
import { getPurchases } from "../../src/purchases";
import { app as appCopy, paywall, settings } from "../../src/strings";
import { colors, radius, space, type } from "../../src/theme";

export default function SettingsScreen() {
  const router = useRouter();
  const ctx = useApp();
  const [protein, setProtein] = useState(String(ctx.targets.protein));
  const [calories, setCalories] = useState(String(ctx.targets.calories));

  const saveTargets = async () => {
    const p = Math.max(1, Math.round(Number(protein) || ctx.targets.protein));
    const c = Math.max(1, Math.round(Number(calories) || ctx.targets.calories));
    await ctx.setTargets({ protein: p, calories: c });
    setProtein(String(p));
    setCalories(String(c));
  };

  const restore = async () => {
    const { premium } = await getPurchases().restore();
    if (premium) {
      ctx.setPremium(true);
      Alert.alert("Restored", paywall.restoreOk);
    } else {
      Alert.alert("Restore", paywall.restoreNone);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.h1}>Settings</Text>

      <Text style={styles.section}>{settings.targets}</Text>
      <View style={styles.row}>
        <Field label={settings.protein} value={protein} onChange={setProtein} />
        <Field label={settings.calories} value={calories} onChange={setCalories} />
      </View>
      <Button label="Save targets" variant="secondary" onPress={() => void saveTargets()} />

      <Text style={[styles.section, { marginTop: space.xl }]}>Scans</Text>
      <Text style={styles.body}>
        {ctx.isPremium
          ? settings.premium
          : `${settings.scansLeft}: ${ctx.freeScansLeft}`}
      </Text>
      {!ctx.isPremium && (
        <Button label="Unlock unlimited scans" onPress={() => router.push({ pathname: "/paywall", params: { from: "settings" } })} />
      )}
      <Button label={paywall.restore} variant="ghost" onPress={() => void restore()} />

      <Text style={[styles.section, { marginTop: space.xl }]}>{settings.legal}</Text>
      <Link label={settings.privacy} url={appCopy.privacyUrl} />
      <Link label={settings.terms} url={appCopy.termsUrl} />
      <Link label={settings.eula} url={appCopy.eulaUrl} />
      <Link label={settings.support} url={`mailto:${appCopy.supportEmail}`} />

      <Text style={styles.caption}>{settings.caption}</Text>
      <Text style={styles.fine}>
        Estimates only. Not medical advice. Meals stay on this iPhone. No HealthKit. Photos are discarded after each
        scan.
      </Text>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        style={styles.input}
      />
    </View>
  );
}

function Link({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} style={styles.link}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  h1: { ...type.h1, color: colors.text, marginBottom: space.lg },
  section: { ...type.title, color: colors.text, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10, marginBottom: 12 },
  field: { flex: 1 },
  label: { ...type.caption, color: colors.muted, marginBottom: 6 },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    ...type.body,
    color: colors.text,
  },
  body: { ...type.body, color: colors.text, marginBottom: 10 },
  caption: { ...type.caption, color: colors.muted, marginTop: space.xl },
  fine: { ...type.caption, color: colors.muted, marginTop: 8 },
  link: { paddingVertical: 10 },
  linkText: { ...type.body, color: colors.navy },
});
