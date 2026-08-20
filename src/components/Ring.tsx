import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, type } from "../theme";

type Props = {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  size?: number;
};

function ringColor(value: number, target: number, base: string): string {
  if (target > 0 && value > target) return colors.amber;
  return base;
}

export function Ring({ label, value, target, unit, color, size = 148 }: Props) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = target <= 0 ? 0 : Math.min(value / target, 1.15);
  const dash = Math.min(pct, 1) * circ;
  const fill = ringColor(value, target, color);
  const over = target > 0 && value > target;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={over ? colors.amberSoft : colors.line}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={fill}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
          />
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.value, { color: fill }]}>{Math.round(value)}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.target}>
        of {target}
        {over ? " · over" : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 6 },
  center: { alignItems: "center", justifyContent: "center" },
  value: { ...type.h2, fontVariant: ["tabular-nums"] },
  unit: { ...type.caption, color: colors.muted, marginTop: -2 },
  label: { ...type.body, fontWeight: "650", color: colors.text },
  target: { ...type.caption, color: colors.muted },
});
