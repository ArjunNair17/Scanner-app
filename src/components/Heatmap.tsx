import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { addDays, localDayKey } from "../lib/day";
import { colors, type } from "../theme";

type DayStat = {
  date: string;
  protein: number;
  proteinTarget: number;
};

function cellColor(stat: DayStat | undefined): string {
  if (!stat || stat.proteinTarget <= 0 || stat.protein <= 0) return "#E8EDE9";
  const pct = stat.protein / stat.proteinTarget;
  if (pct >= 1) return colors.accent;
  if (pct >= 0.66) return "#4ADE80";
  if (pct >= 0.33) return "#86EFAC";
  return "#BBF7D0";
}

export function Heatmap({ days, weeks = 12 }: { days: DayStat[]; weeks?: number }) {
  const today = localDayKey();
  const start = addDays(today, -(weeks * 7 - 1));
  const byDate = new Map(days.map((d) => [d.date, d]));
  const columns: string[][] = [];
  let cursor = start;
  for (let w = 0; w < weeks; w += 1) {
    const col: string[] = [];
    for (let d = 0; d < 7; d += 1) {
      col.push(cursor);
      cursor = addDays(cursor, 1);
    }
    columns.push(col);
  }

  return (
    <View>
      <View style={styles.grid}>
        {columns.map((col) => (
          <View key={col[0]} style={styles.col}>
            {col.map((date) => (
              <View
                key={date}
                style={[
                  styles.cell,
                  { backgroundColor: cellColor(byDate.get(date)) },
                  date === today && styles.today,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={styles.caption}>Protein vs your daily target · last {weeks} weeks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: 4 },
  col: { gap: 4 },
  cell: { width: 14, height: 14, borderRadius: 3 },
  today: { borderWidth: 1, borderColor: colors.text },
  caption: { ...type.caption, color: colors.muted, marginTop: 10 },
});
