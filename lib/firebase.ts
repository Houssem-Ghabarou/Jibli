/**
 * Firebase Setup Instructions
 *
 * This app uses @react-native-firebase which auto-initializes from native config files.
 * No JavaScript initialization code is needed.
 *
 * Setup steps:
 * 1. Go to https://console.firebase.google.com
 * 2. Create a project named "Jibli"
 * 3. Enable Email/Password authentication
 * 4. Enable Firestore Database
 * 5. Enable Firebase Storage
 *
 * Android:
 *   - Add Android app with package name: com.jibli.app
 *   - Download google-services.json → place in project root
 *
 * iOS:
 *   - Add iOS app with bundle ID: com.jibli.app
 *   - Download GoogleService-Info.plist → place in project root
 *
 * Then run: npx expo prebuild --clean
 * Then run: npx expo run:android  OR  npx expo run:ios
 *
 * Note: This app requires a development build. It does NOT work with Expo Go.
 */

export {};
