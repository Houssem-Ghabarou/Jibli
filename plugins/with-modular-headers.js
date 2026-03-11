const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

module.exports = function withModularHeaders(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
      let podfile = fs.readFileSync(podfilePath, "utf8");

      const snippet = `
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      # Remove the -Werror flag for non-modular includes
      cflags = config.build_settings['OTHER_CFLAGS'] || '$(inherited)'
      cflags = [cflags].flatten.reject { |f| f == '-Werror=non-modular-include-in-framework-module' }
      cflags << '-Wno-error=non-modular-include-in-framework-module'
      config.build_settings['OTHER_CFLAGS'] = cflags
    end
  end`;

      if (!podfile.includes("ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES")) {
        podfile = podfile.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|\n${snippet}`
        );
        fs.writeFileSync(podfilePath, podfile);
      }

      return config;
    },
  ]);
};