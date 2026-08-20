import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";
import type { Glp1Answer, GoalAnswer, MealsAnswer, QuizAnswers } from "../src/types";
import { quiz } from "../src/strings";
import { colors, radius, space, type } from "../src/theme";

type Step = 1 | 2 | 3;

export default function QuizScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [glp1, setGlp1] = useState<Glp1Answer | null>(null);
  const [goal, setGoal] = useState<GoalAnswer | null>(null);
  const [meals, setMeals] = useState<MealsAnswer | null>(null);

  const canNext = step === 1 ? !!glp1 : step === 2 ? !!goal : !!meals;

  const next = () => {
    if (step < 3) {
      setStep((step + 1) as Step);
      return;
    }
    if (!glp1 || !goal || !meals) return;
    const answers: QuizAnswers = { glp1, goal, meals };
    router.push({ pathname: "/preparing", params: { quiz: JSON.stringify(answers) } });
  };

  return (
    <Screen>
      <Text style={styles.step}>Question {step} of 3</Text>
      {step === 1 && (
        <Question title={quiz.q1.title}>
          {quiz.q1.options.map((opt) => (
            <Choice key={opt.id} label={opt.label} selected={glp1 === opt.id} onPress={() => setGlp1(opt.id)} />
          ))}
        </Question>
      )}
      {step === 2 && (
        <Question title={quiz.q2.title}>
          {quiz.q2.options.map((opt) => (
            <Choice key={opt.id} label={opt.label} selected={goal === opt.id} onPress={() => setGoal(opt.id)} />
          ))}
        </Question>
      )}
      {step === 3 && (
        <Question title={quiz.q3.title}>
          {quiz.q3.options.map((opt) => (
            <Choice key={opt.id} label={opt.label} selected={meals === opt.id} onPress={() => setMeals(opt.id)} />
          ))}
        </Question>
      )}
      <View style={styles.footer}>
        {step > 1 ? (
          <Button label="Back" variant="ghost" onPress={() => setStep((step - 1) as Step)} />
        ) : (
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
        )}
        <Button label={step === 3 ? "See my targets" : "Next"} onPress={next} disabled={!canNext} />
      </View>
    </Screen>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.q}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.opts}>{children}</View>
    </View>
  );
}

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.choice, selected && styles.choiceOn]}>
      <Text style={[styles.choiceText, selected && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  step: { ...type.caption, color: colors.muted, marginBottom: 8 },
  q: { flex: 1 },
  title: { ...type.h2, color: colors.text, marginBottom: space.lg },
  opts: { gap: 10 },
  choice: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  choiceOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  choiceText: { ...type.body, color: colors.text },
  choiceTextOn: { fontWeight: "700", color: colors.text },
  footer: { gap: 8, paddingTop: space.md },
});
