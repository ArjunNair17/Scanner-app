import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { CloseX } from "../src/components/CloseX";
import { LegalLinks } from "../src/components/LegalLinks";
import { Screen } from "../src/components/Screen";
import { useApp } from "../src/context/AppContext";
import { autoRenewLegalBlock, displayPrice } from "../src/lib/legal";
import { isGlp1, targetsFromQuiz } from "../src/lib/targets";
import {
  FALLBACK_MONTHLY,
  FALLBACK_YEARLY,
  MONTHLY_PRODUCT_ID,
  YEARLY_PRODUCT_ID,
  getPurchases,
  type ProductId,
} from "../src/purchases";
import { paywall } from "../src/strings";
import { colors, radius, space, type } from "../src/theme";
import type { QuizAnswers } from "../src/types";

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ quiz?: string; from?: string }>();
  const app = useApp();
  const [selected, setSelected] = useState<ProductId>(YEARLY_PRODUCT_ID);
  const [busy, setBusy] = useState(false);

  const quiz = useMemo<QuizAnswers | null>(() => {
    if (params.quiz) {
      try {
        return JSON.parse(params.quiz) as QuizAnswers;
      } catch {
        return app.quiz;
      }
    }
    return app.quiz;
  }, [app.quiz, params.quiz]);

  const fromOnboarding = params.from === "onboarding" || !app.onboardingComplete;
  const yearly = app.offerings?.yearly ?? FALLBACK_YEARLY;
  const monthly = app.offerings?.monthly ?? FALLBACK_MONTHLY;
  const offeringsFailed = !app.offeringsLoaded || app.offerings?.status === "failed";
  const canPurchase = app.offeringsLoaded && app.offerings?.status === "ready";
  const headline = isGlp1(quiz) ? paywall.headlineGlp1 : paywall.headlineElse;

  const finishOnboarding = async () => {
    if (!app.onboardingComplete) {
      const answers = quiz ?? { glp1: "none", goal: "general", meals: "three" };
      await app.completeOnboarding(answers, targetsFromQuiz(answers));
    }
    router.replace("/(tabs)/today");
  };

  const close = () => {
    if (fromOnboarding) {
      void finishOnboarding();
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/today");
  };

  const buy = async () => {
    if (!canPurchase) return;
    setBusy(true);
    const result = await getPurchases().purchase(selected);
    setBusy(false);
    if (result.ok) {
      app.setPremium(true);
      await finishOnboarding();
      return;
    }
    if (result.reason === "cancelled") return;
    Alert.alert("Purchase", result.message);
  };

  const restore = async () => {
    setBusy(true);
    const { premium } = await getPurchases().restore();
    setBusy(false);
    if (premium) {
      app.setPremium(true);
      Alert.alert("Restored", paywall.restoreOk);
      await finishOnboarding();
      return;
    }
    Alert.alert("Restore", paywall.restoreNone);
  };

  return (
    <Screen scroll>
      <View style={styles.top}>
        <CloseX onPress={close} />
        {fromOnboarding ? (
          <Pressable onPress={close} hitSlop={8}>
            <Text style={styles.skip}>{paywall.continueFree}</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <Text style={styles.h1}>{headline}</Text>
      <View style={styles.benefits}>
        {paywall.benefits.map((b) => (
          <Text key={b} style={styles.benefit}>
            ✓  {b}
          </Text>
        ))}
      </View>

      {!app.offeringsLoaded && <Text style={styles.banner}>{paywall.loadingPrices}</Text>}
      {app.offeringsLoaded && offeringsFailed && <Text style={styles.banner}>{paywall.offeringsFailed}</Text>}

      <Pressable
        onPress={() => setSelected(YEARLY_PRODUCT_ID)}
        style={[styles.sku, selected === YEARLY_PRODUCT_ID && styles.skuOn]}
      >
        <View style={styles.skuTop}>
          <Text style={styles.skuTitle}>{paywall.yearlyTitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{paywall.trial}</Text>
          </View>
        </View>
        <Text style={styles.skuPrice}>{displayPrice(yearly, paywall.yearlyFallback)}</Text>
        <Text style={styles.skuMeta}>1 year · auto-renew</Text>
      </Pressable>

      <Pressable
        onPress={() => setSelected(MONTHLY_PRODUCT_ID)}
        style={[styles.sku, selected === MONTHLY_PRODUCT_ID && styles.skuOn]}
      >
        <Text style={styles.skuTitle}>{paywall.monthlyTitle}</Text>
        <Text style={styles.skuPrice}>{displayPrice(monthly, paywall.monthlyFallback)}</Text>
        <Text style={styles.skuMeta}>1 month · auto-renew</Text>
      </Pressable>

      <Button
        label={selected === YEARLY_PRODUCT_ID ? paywall.ctaTrial : paywall.ctaSubscribe}
        onPress={() => void buy()}
        disabled={!canPurchase}
        loading={busy}
      />
      {fromOnboarding && (
        <Button label={paywall.continueFree} variant="ghost" onPress={close} />
      )}
      <Button label={paywall.restore} variant="ghost" onPress={() => void restore()} />

      <Text style={styles.legal}>{autoRenewLegalBlock(yearly, monthly)}</Text>
      <LegalLinks />
      <Text style={styles.support} onPress={() => Linking.openURL(`mailto:support@proteinsnap.app`)}>
        support@proteinsnap.app
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.lg,
  },
  skip: { ...type.caption, color: colors.muted, fontWeight: "600" },
  h1: { ...type.h1, color: colors.text, marginBottom: space.md },
  benefits: { gap: 8, marginBottom: space.lg },
  benefit: { ...type.body, color: colors.text },
  banner: {
    ...type.caption,
    color: colors.text,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: space.md,
  },
  sku: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
  },
  skuOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  skuTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skuTitle: { ...type.body, fontWeight: "700", color: colors.text },
  skuPrice: { ...type.title, color: colors.text, marginTop: 4 },
  skuMeta: { ...type.caption, color: colors.muted, marginTop: 2 },
  badge: { backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  legal: { ...type.caption, color: colors.muted, marginTop: space.md, marginBottom: 10 },
  support: { ...type.caption, color: colors.navy, textAlign: "center", marginTop: 10 },
});
