export const colors = {
  bg: "#F7F8F6",
  card: "#FFFFFF",
  text: "#122017",
  muted: "#5B6B62",
  line: "#E4EBE5",
  accent: "#22C55E",
  accentPressed: "#16A34A",
  accentSoft: "#E8F8EE",
  navy: "#1E3A5F",
  navySoft: "#E8EEF5",
  amber: "#F59E0B",
  amberSoft: "#FEF6E6",
  white: "#FFFFFF",
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const type = {
  h1: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
  h2: { fontSize: 24, lineHeight: 30, fontWeight: "700" as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: "650" as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  hero: { fontSize: 56, lineHeight: 62, fontWeight: "700" as const },
};
