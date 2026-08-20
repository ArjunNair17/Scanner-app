import React from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { app } from "../strings";
import { colors, type } from "../theme";

export function LegalLinks() {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => Linking.openURL(app.privacyUrl)}>
        <Text style={styles.link}>Privacy Policy</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable onPress={() => Linking.openURL(app.eulaUrl)}>
        <Text style={styles.link}>Terms of Use (EULA)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  link: { ...type.caption, color: colors.navy, textDecorationLine: "underline" },
  dot: { ...type.caption, color: colors.muted },
});
