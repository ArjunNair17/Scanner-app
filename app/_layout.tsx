import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Appearance } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "../src/context/AppContext";
import { colors } from "../src/theme";

Appearance.setColorScheme("light");

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="welcome" />
            <Stack.Screen name="quiz" />
            <Stack.Screen name="preparing" />
            <Stack.Screen name="paywall" options={{ animation: "fade" }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="consent" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
            <Stack.Screen name="camera" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="analyzing" options={{ animation: "fade", gestureEnabled: false }} />
            <Stack.Screen name="result" options={{ gestureEnabled: false }} />
          </Stack>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
