import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "../../src/components/Button";
import { MealRow } from "../../src/components/MealRow";
import { Ring } from "../../src/components/Ring";
import { Screen } from "../../src/components/Screen";
import { useApp } from "../../src/context/AppContext";
import { scanEntryRoute } from "../../src/lib/scans";
import { prettyDate, localDayKey } from "../../src/lib/day";
import { today as copy } from "../../src/strings";
import { colors, space, type } from "../../src/theme";

export default function TodayScreen() {
  const router = useRouter();
  const app = useApp();

  const onScan = useCallback(() => {
    const dest = scanEntryRoute({
      aiConsentAccepted: app.aiConsentAccepted,
      isPremium: app.isPremium,
      freeScansUsed: app.freeScansUsed,
    });
    if (dest === "consent") {
      router.push("/consent");
      return;
    }
    if (dest === "paywall") {
      router.push({ pathname: "/paywall", params: { from: "gate" } });
      return;
    }
    router.push("/camera");
  }, [app.aiConsentAccepted, app.freeScansUsed, app.isPremium, router]);

  return (
    <Screen scroll>
      <Text style={styles.kicker}>{prettyDate(localDayKey())}</Text>
      <Text style={styles.h1}>Today</Text>
      <View style={styles.rings}>
        <Ring
          label="Protein"
          value={app.todayProtein}
          target={app.targets.protein}
          unit="g"
          color={colors.accent}
        />
        <Ring
          label="Calories"
          value={app.todayCalories}
          target={app.targets.calories}
          unit="kcal"
          color={colors.navy}
        />
      </View>

      {app.todayMeals.length === 0 ? (
        <Text style={styles.empty}>{copy.empty}</Text>
      ) : (
        <View style={styles.list}>
          {app.todayMeals.map((meal) => (
            <MealRow key={meal.id} meal={meal} />
          ))}
        </View>
      )}

      <View style={styles.cta}>
        <Button label={copy.scan} onPress={onScan} />
        {!app.isPremium && (
          <Text style={styles.left}>
            {app.freeScansLeft} free scan{app.freeScansLeft === 1 ? "" : "s"} left
          </Text>
        )}
      </View>
    </Screen>
  );
}

export function showFirstSaveTip(onDone: () => void) {
  Alert.alert("Saved", copy.firstSaveTip, [{ text: "OK", onPress: onDone }]);
}

const styles = StyleSheet.create({
  kicker: { ...type.caption, color: colors.muted },
  h1: { ...type.h1, color: colors.text, marginBottom: space.lg },
  rings: { flexDirection: "row", justifyContent: "space-around", marginBottom: space.xl },
  empty: { ...type.body, color: colors.muted, textAlign: "center", marginVertical: space.xl },
  list: { gap: 10, marginBottom: space.lg },
  cta: { marginTop: space.md, gap: 8 },
  left: { ...type.caption, color: colors.muted, textAlign: "center" },
});
