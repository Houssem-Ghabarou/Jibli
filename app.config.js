import withFirebaseAppDelegate from "./plugins/with-firebase-appdelegate";

export default {
  expo: {
    name: "Jibo",
    slug: "Jibo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/Jibli/LogoJibliPNG.png",
    scheme: "jibo",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jibo.app",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.jibo.app",
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: "./assets/Jibli/LogoJibliPNG.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/Jibli/LogoJibliPNG.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      withFirebaseAppDelegate,
      // withModularHeaders,
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "dynamic",
            deploymentTarget: "15.1",
           
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "3f4a318d-bf58-44d7-920d-5fd3ba5b97cd"
      }
    }
  }
};