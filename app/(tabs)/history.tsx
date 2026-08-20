import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Heatmap } from "../../src/components/Heatmap";
import { MealRow } from "../../src/components/MealRow";
import { Screen } from "../../src/components/Screen";
import { useApp } from "../../src/context/AppContext";
import { addDays, localDayKey, prettyDate } from "../../src/lib/day";
import { daysInRange, mealsInRange, totals } from "../../src/lib/db";
import type { Meal } from "../../src/types";
import { colors, space, type } from "../../src/theme";

export default function HistoryScreen() {
  const { targets } = useApp();
  const [cells, setCells] = useState<{ date: string; protein: number; proteinTarget: number }[]>([]);
  const [recent, setRecent] = useState<Meal[]>([]);

  useEffect(() => {
    const today = localDayKey();
    const start = addDays(today, -83);
    Promise.all([mealsInRange(start, today), daysInRange(start, today)]).then(([meals, days]) => {
      const byDate = new Map<string, Meal[]>();
      for (const meal of meals) {
        const list = byDate.get(meal.date) ?? [];
        list.push(meal);
        byDate.set(meal.date, list);
      }
      const dayTargets = new Map(days.map((d) => [d.date, d]));
      const next = [...byDate.entries()].map(([date, list]) => ({
        date,
        protein: totals(list).protein,
        proteinTarget: dayTargets.get(date)?.protein_target ?? targets.protein,
      }));
      setCells(next);
      setRecent(meals.slice(-12).reverse());
    });
  }, [targets.protein]);

  return (
    <Screen scroll>
      <Text style={styles.h1}>History</Text>
      <Text style={styles.sub}>Stays on this iPhone. No account, no cloud meals.</Text>
      <View style={styles.card}>
        <Heatmap days={cells} />
      </View>
      <Text style={styles.section}>Recent meals</Text>
      {recent.length === 0 ? (
        <Text style={styles.empty}>Nothing logged yet.</Text>
      ) : (
        <View style={styles.list}>
          {recent.map((meal) => (
            <View key={meal.id} style={styles.block}>
              <Text style={styles.date}>{prettyDate(meal.date)}</Text>
              <MealRow meal={meal} />
            </View>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h1: { ...type.h1, color: colors.text },
  sub: { ...type.caption, color: colors.muted, marginBottom: space.lg },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: space.xl,
  },
  section: { ...type.title, color: colors.text, marginBottom: 10 },
  empty: { ...type.body, color: colors.muted },
  list: { gap: 12 },
  block: { gap: 6 },
  date: { ...type.caption, color: colors.muted },
});
