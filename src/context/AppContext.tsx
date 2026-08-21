import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Meal, QuizAnswers, Targets } from "../types";
import { ensureDay, insertMeal, mealsForDate, todaySnapshot, totals, updateDayTargets } from "../lib/db";
import { getOrCreateDeviceId } from "../lib/device";
import { localDayKey } from "../lib/day";
import { parseAiConsentAccepted, readAiConsentAccepted } from "../lib/consent";
import { planIdentifiedSave, remainingFreeScans } from "../lib/scans";
import { STORAGE_KEYS } from "../lib/storage";
import { DEFAULT_TARGETS } from "../lib/targets";
import { getPurchases, type OfferingsResult } from "../purchases";

type AppContextValue = {
  ready: boolean;
  onboardingComplete: boolean;
  quiz: QuizAnswers | null;
  targets: Targets;
  freeScansUsed: number;
  freeScansLeft: number;
  aiConsentAccepted: boolean;
  consentHydrated: boolean;
  deviceId: string;
  firstSaveTipShown: boolean;
  isPremium: boolean;
  offerings: OfferingsResult | null;
  offeringsLoaded: boolean;
  purchasesKind: "stub" | "native";
  todayMeals: Meal[];
  todayProtein: number;
  todayCalories: number;
  completeOnboarding: (quiz: QuizAnswers, targets: Targets) => Promise<void>;
  acceptConsent: () => Promise<void>;
  refreshConsent: () => Promise<boolean>;
  setTargets: (targets: Targets) => Promise<void>;
  consumeIdentifiedScan: () => Promise<number>;
  saveMeal: (meal: Meal) => Promise<void>;
  markFirstSaveTipShown: () => Promise<void>;
  refreshPremium: () => Promise<boolean>;
  refreshToday: () => Promise<void>;
  setPremium: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [quiz, setQuiz] = useState<QuizAnswers | null>(null);
  const [targets, setTargetsState] = useState<Targets>(DEFAULT_TARGETS);
  const [freeScansUsed, setFreeScansUsed] = useState(0);
  const [aiConsentAccepted, setAiConsentAccepted] = useState<boolean | null>(null);
  const [deviceId, setDeviceId] = useState("");
  const [firstSaveTipShown, setFirstSaveTipShown] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [offerings, setOfferings] = useState<OfferingsResult | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const purchases = getPurchases();

  const loadToday = useCallback(async (nextTargets: Targets) => {
    const snap = await todaySnapshot(nextTargets);
    setTodayMeals(snap.meals);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [onboarding, quizRaw, usedRaw, consent, tip, targetsRaw, id] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.onboardingComplete),
        AsyncStorage.getItem(STORAGE_KEYS.quizAnswers),
        AsyncStorage.getItem(STORAGE_KEYS.freeScansUsed),
        AsyncStorage.getItem(STORAGE_KEYS.aiConsentAccepted),
        AsyncStorage.getItem(STORAGE_KEYS.firstSaveTipShown),
        AsyncStorage.getItem(STORAGE_KEYS.targets),
        getOrCreateDeviceId(),
      ]);
      const nextQuiz = parseJson<QuizAnswers | null>(quizRaw, null);
      const nextTargets = parseJson<Targets>(targetsRaw, DEFAULT_TARGETS);
      if (cancelled) return;
      setOnboardingComplete(onboarding === "1");
      setQuiz(nextQuiz);
      setTargetsState(nextTargets);
      setFreeScansUsed(Number(usedRaw || 0) || 0);
      setAiConsentAccepted(parseAiConsentAccepted(consent));
      setFirstSaveTipShown(tip === "1");
      setDeviceId(id);

      await purchases.init();
      const [premium, offer] = await Promise.all([purchases.isPremium(), purchases.getOfferings()]);
      if (cancelled) return;
      setIsPremium(premium);
      setOfferings(offer);
      await loadToday(nextTargets);
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadToday, purchases]);

  const completeOnboarding = useCallback(async (nextQuiz: QuizAnswers, nextTargets: Targets) => {
    setQuiz(nextQuiz);
    setTargetsState(nextTargets);
    setOnboardingComplete(true);
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.quizAnswers, JSON.stringify(nextQuiz)],
      [STORAGE_KEYS.targets, JSON.stringify(nextTargets)],
      [STORAGE_KEYS.onboardingComplete, "1"],
    ]);
    await ensureDay(localDayKey(), nextTargets);
    await loadToday(nextTargets);
  }, [loadToday]);

  const acceptConsent = useCallback(async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.aiConsentAccepted, "1");
    setAiConsentAccepted(true);
  }, []);

  const refreshConsent = useCallback(async () => {
    const accepted = await readAiConsentAccepted(AsyncStorage);
    setAiConsentAccepted(accepted);
    return accepted;
  }, []);

  const setTargets = useCallback(async (next: Targets) => {
    setTargetsState(next);
    await AsyncStorage.setItem(STORAGE_KEYS.targets, JSON.stringify(next));
    await updateDayTargets(localDayKey(), next);
  }, []);

  const consumeIdentifiedScan = useCallback(async () => {
    if (isPremium) return freeScansUsed;
    const plan = planIdentifiedSave({
      identified: true,
      isPremium: false,
      freeScansUsed,
    });
    if (!plan.consume) return freeScansUsed;
    setFreeScansUsed(plan.nextUsed);
    await AsyncStorage.setItem(STORAGE_KEYS.freeScansUsed, String(plan.nextUsed));
    return plan.nextUsed;
  }, [freeScansUsed, isPremium]);

  const saveMeal = useCallback(async (meal: Meal) => {
    await insertMeal(meal);
    const meals = await mealsForDate(meal.date);
    if (meal.date === localDayKey()) setTodayMeals(meals);
  }, []);

  const markFirstSaveTipShown = useCallback(async () => {
    setFirstSaveTipShown(true);
    await AsyncStorage.setItem(STORAGE_KEYS.firstSaveTipShown, "1");
  }, []);

  const refreshPremium = useCallback(async () => {
    const premium = await purchases.isPremium();
    setIsPremium(premium);
    return premium;
  }, [purchases]);

  const refreshToday = useCallback(async () => {
    await loadToday(targets);
  }, [loadToday, targets]);

  const sums = totals(todayMeals);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      onboardingComplete,
      quiz,
      targets,
      freeScansUsed,
      freeScansLeft: remainingFreeScans(freeScansUsed),
      aiConsentAccepted: aiConsentAccepted === true,
      consentHydrated: aiConsentAccepted !== null,
      deviceId,
      firstSaveTipShown,
      isPremium,
      offerings,
      offeringsLoaded: offerings !== null,
      purchasesKind: purchases.kind,
      todayMeals,
      todayProtein: sums.protein,
      todayCalories: sums.calories,
      completeOnboarding,
      acceptConsent,
      refreshConsent,
      setTargets,
      consumeIdentifiedScan,
      saveMeal,
      markFirstSaveTipShown,
      refreshPremium,
      refreshToday,
      setPremium: setIsPremium,
    }),
    [
      ready,
      onboardingComplete,
      quiz,
      targets,
      freeScansUsed,
      aiConsentAccepted,
      deviceId,
      firstSaveTipShown,
      isPremium,
      offerings,
      purchases.kind,
      todayMeals,
      sums.protein,
      sums.calories,
      completeOnboarding,
      acceptConsent,
      refreshConsent,
      setTargets,
      consumeIdentifiedScan,
      saveMeal,
      markFirstSaveTipShown,
      refreshPremium,
      refreshToday,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
