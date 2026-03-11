const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin to automatically configure Firebase in AppDelegate
 *
 * This plugin automatically adds FirebaseApp.configure() to the
 * didFinishLaunchingWithOptions method in AppDelegate.swift during prebuild.
 *
 * This eliminates the need to manually add the Firebase initialization
 * after each prebuild.
 */
module.exports = function withFirebaseAppDelegate(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const appDelegatePath = path.join(
        config.modRequest.projectRoot,
        "ios",
        "Stokily",
        "AppDelegate.swift"
      );

      // Check if the file exists
      if (!fs.existsSync(appDelegatePath)) {
        console.log(
          "⚠️  AppDelegate.swift not found, skipping Firebase configuration."
        );
        return config;
      }

      let contents = fs.readFileSync(appDelegatePath, "utf-8");

      // Check if FirebaseApp.configure() is already present
      if (contents.includes("FirebaseApp.configure()")) {
        console.log("ℹ️  AppDelegate already has FirebaseApp.configure().");
        return config;
      }

      // Ensure FirebaseCore is imported
      if (!contents.includes("import FirebaseCore")) {
        // Add import after other imports
        const importRegex = /(import \w+\n)+/;
        contents = contents.replace(
          importRegex,
          (match) => `${match}import FirebaseCore\n`
        );
        console.log("✅ Added 'import FirebaseCore' to AppDelegate.swift");
      }

      // Find the didFinishLaunchingWithOptions method and add FirebaseApp.configure()
      // Pattern: find the method declaration followed by ) -> Bool {
      const methodPattern = /(didFinishLaunchingWithOptions[^{]*\{)\s*\n/;

      if (methodPattern.test(contents)) {
        contents = contents.replace(
          methodPattern,
          "$1\n    FirebaseApp.configure()\n"
        );
        fs.writeFileSync(appDelegatePath, contents);
        console.log("✅ Added FirebaseApp.configure() to AppDelegate.swift");
      } else {
        console.log(
          "⚠️  Could not find didFinishLaunchingWithOptions method in AppDelegate.swift"
        );
      }

      return config;
    },
  ]);
};
