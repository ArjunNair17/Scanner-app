import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Meal } from "../types";
import { slotLabel } from "../lib/slot";
import { colors, radius, type } from "../theme";

export function MealRow({ meal }: { meal: Meal }) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.name}>{meal.name}</Text>
        <Text style={styles.meta}>
          {slotLabel(meal.slot)} · {meal.portion === 1 ? "1×" : `${meal.portion}×`}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.protein}>{Math.round(meal.protein_g)}g P</Text>
        <Text style={styles.cal}>{Math.round(meal.calories)} cal</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  left: { flex: 1, paddingRight: 12 },
  name: { ...type.body, fontWeight: "650", color: colors.text },
  meta: { ...type.caption, color: colors.muted, marginTop: 2 },
  right: { alignItems: "flex-end" },
  protein: { ...type.body, fontWeight: "700", color: colors.accent },
  cal: { ...type.caption, color: colors.navy, marginTop: 2 },
});
