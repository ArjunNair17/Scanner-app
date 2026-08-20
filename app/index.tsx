import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useApp } from "../src/context/AppContext";
import { colors } from "../src/theme";

export default function Index() {
  const { ready, onboardingComplete } = useApp();
  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }
  if (!onboardingComplete) return <Redirect href="/welcome" />;
  return <Redirect href="/(tabs)/today" />;
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
});
