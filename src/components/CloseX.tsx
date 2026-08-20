import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme";

export function CloseX({ onPress, testID = "close-x" }: { onPress: () => void; testID?: string }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel="Close"
      onPress={onPress}
      hitSlop={12}
      style={styles.hit}
    >
      <Text style={styles.x}>✕</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  x: { fontSize: 16, color: colors.text, marginTop: -1 },
});
