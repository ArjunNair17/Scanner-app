import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/context/AppContext";
import { localDayKey } from "../src/lib/day";
import { applyPortion, formatPortion, PORTION_OPTIONS } from "../src/lib/portion";
import { planIdentifiedSave } from "../src/lib/scans";
import { currentSlot } from "../src/lib/slot";
import { errors, result as copy, today as todayCopy } from "../src/strings";
import { colors, radius, space, type } from "../src/theme";
import type { FoodEstimate, Meal } from "../src/types";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ResultScreen() {
  const router = useRouter();
  const app = useApp();
  const params = useLocalSearchParams<{ food?: string; error?: string; message?: string }>();
  const [portion, setPortion] = useState(1);

  const food = useMemo<FoodEstimate | null>(() => {
    if (!params.food) return null;
    try {
      return JSON.parse(params.food) as FoodEstimate;
    } catch {
      return null;
    }
  }, [params.food]);

  const error = params.error;
  const scaled = food && food.identified ? applyPortion(food, portion) : null;
  const rough = (food?.confidence ?? 100) < 60;

  const save = async () => {
    if (!food || !scaled) return;
    const plan = planIdentifiedSave({
      identified: food.identified,
      isPremium: app.isPremium,
      freeScansUsed: app.freeScansUsed,
    });
    if (plan.action === "paywall") {
      router.replace({ pathname: "/paywall", params: { from: "gate" } });
      return;
    }
    if (plan.action === "skip") return;
    const meal: Meal = {
      id: newId(),
      date: localDayKey(),
      slot: currentSlot(),
      created_at: new Date().toISOString(),
      photo_uri: null,
      name: food.name || "Meal",
      protein_g: scaled.protein_g,
      calories: scaled.calories,
      fat_g: scaled.fat_g,
      carbs_g: scaled.carbs_g,
      portion,
      confidence: food.confidence,
    };
    await app.saveMeal(meal);
    if (plan.consume) {
      await app.consumeIdentifiedScan();
    }
    if (!app.firstSaveTipShown) {
      await app.markFirstSaveTipShown();
      Alert.alert("Saved", todayCopy.firstSaveTip, [
        { text: "OK", onPress: () => router.replace("/(tabs)/today") },
      ]);
      return;
    }
    router.replace("/(tabs)/today");
  };

  if (error || !food || !food.identified) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.h2}>{error ? "Couldn’t scan" : "Not food"}</Text>
          <Text style={styles.copy}>
            {error ? params.message || errors[error] || errors.upstream : copy.unidentified}
          </Text>
        </View>
        <Button label={copy.retry} onPress={() => router.replace("/camera")} />
        <Button label="Back to Today" variant="ghost" onPress={() => router.replace("/(tabs)/today")} />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.kicker}>{food.name}</Text>
      <Text style={styles.hero}>{Math.round(scaled?.protein_g ?? 0)}</Text>
      <Text style={styles.heroUnit}>g protein</Text>
      {food.serving_description ? <Text style={styles.serving}>{food.serving_description}</Text> : null}

      {rough && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{copy.rough}</Text>
        </View>
      )}

      <View style={styles.macros}>
        <Macro label="Calories" value={`${scaled?.calories ?? 0}`} />
        <Macro label="Fat" value={`${scaled?.fat_g ?? 0}g`} />
        <Macro label="Carbs" value={`${scaled?.carbs_g ?? 0}g`} />
      </View>

      <Text style={styles.section}>Portion</Text>
      <View style={styles.portions}>
        {PORTION_OPTIONS.map((p) => (
          <Pressable key={p} onPress={() => setPortion(p)} style={[styles.pChip, portion === p && styles.pChipOn]}>
            <Text style={[styles.pText, portion === p && styles.pTextOn]}>{formatPortion(p)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.disclaimer}>{copy.disclaimer}</Text>
      <Button label={copy.save} onPress={() => void save()} />
      <Button label={copy.retry} variant="ghost" onPress={() => router.replace("/camera")} />
    </Screen>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macro}>
      <Text style={styles.macroVal}>{value}</Text>
      <Text style={styles.macroLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", gap: 12 },
  h2: { ...type.h2, color: colors.text },
  copy: { ...type.body, color: colors.muted },
  kicker: { ...type.body, color: colors.muted, textAlign: "center" },
  hero: { ...type.hero, color: colors.accent, textAlign: "center", marginTop: 4 },
  heroUnit: { ...type.title, color: colors.text, textAlign: "center", marginBottom: 8 },
  serving: { ...type.caption, color: colors.muted, textAlign: "center", marginBottom: space.md },
  banner: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: space.md,
  },
  bannerText: { ...type.caption, color: colors.text, fontWeight: "700", textAlign: "center" },
  macros: { flexDirection: "row", gap: 8, marginBottom: space.lg },
  macro: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  macroVal: { ...type.title, color: colors.navy },
  macroLbl: { ...type.caption, color: colors.muted },
  section: { ...type.body, fontWeight: "700", color: colors.text, marginBottom: 8 },
  portions: { flexDirection: "row", gap: 8, marginBottom: space.lg },
  pChip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.card,
  },
  pChipOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  pText: { ...type.body, fontWeight: "650", color: colors.text },
  pTextOn: { color: colors.text },
  disclaimer: { ...type.caption, color: colors.muted, textAlign: "center", marginBottom: space.md },
});
