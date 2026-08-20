import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Protein Scanner",
  slug: "protein-scanner",
  scheme: "proteinscanner",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#F7F8F6",
  },
  ios: {
    bundleIdentifier: "app.proteinsnap.scanner",
    supportsTablet: false,
    infoPlist: {
      NSCameraUsageDescription:
        "Photograph your plate so Protein Scanner can estimate calories and protein.",
      NSPhotoLibraryUsageDescription:
        "Choose a plate photo so Protein Scanner can estimate calories and protein.",
      ITSAppUsesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["CA92.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
          NSPrivacyAccessedAPITypeReasons: ["C617.1"],
        },
      ],
    },
  },
  android: {
    package: "app.proteinsnap.scanner",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#F7F8F6",
    },
  },
  plugins: [
    "expo-router",
    "expo-sqlite",
    "expo-system-ui",
    "expo-splash-screen",
    [
      "expo-camera",
      {
        cameraPermission:
          "Photograph your plate so Protein Scanner can estimate calories and protein.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Choose a plate photo so Protein Scanner can estimate calories and protein.",
      },
    ],
  ],
  experiments: {
    typedRoutes: false,
  },
  extra: {
    publicName: "Protein Scanner: AI Calories",
    supportEmail: "support@proteinsnap.app",
    privacyUrl: "https://proteinsnap.app/privacy",
    supportUrl: "https://proteinsnap.app/support",
    termsUrl: "https://proteinsnap.app/terms",
    eulaUrl: "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
  },
};

export default config;
