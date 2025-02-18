module.exports = {
  expo: {
    name: "Antonio",
    slug: "antonio",
    // ... other config
    extra: {
      EXPO_PUBLIC_OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    ios: {
      bundleIdentifier: "com.yourname.antonio",
      // ... other iOS config
      infoPlist: {
        NSMicrophoneUsageDescription: "This app needs access to the microphone to record your Spanish practice",
      }
    }
  }
}; 