const { withPodfile, withXcodeProject } = require('expo/config-plugins');

// Resource bundles can declare a lower target than the application itself.
// Xcode 27 rejects those targets, so keep them at least at the app minimum.
module.exports = function withPodMinimumIOS(config) {
  config = withXcodeProject(config, (config) => {
    const phases = config.modResults.hash.project.objects.PBXShellScriptBuildPhase;
    for (const phase of Object.values(phases)) {
      if (!phase || typeof phase !== 'object' || !phase.shellScript) continue;
      const script = JSON.parse(phase.shellScript);
      phase.shellScript = JSON.stringify(
        script.replace(/^(`.*react-native-xcode\.sh.*`)$/m, '"$1"'),
      );
    }
    return config;
  });
  return withPodfile(config, (config) => {
    const marker = '# Xcode 27 rejects dependency targets';
    if (config.modResults.contents.includes(marker)) return config;
    const anchor = '  post_install do |installer|\n';
    if (!config.modResults.contents.includes(anchor)) {
      throw new Error('Cannot locate Podfile post_install hook for minimum iOS targets.');
    }
    const block = `    # Quote project paths for the SDK 54 Constants build phase.
    installer.pods_project.targets.each do |target|
      next unless target.name == 'EXConstants'
      target.shell_script_build_phases.each do |phase|
        next unless phase.name.include?('Generate app.config')
        phase.shell_script = <<~'SCRIPT'
          set -e
          PACKAGE_DIR="\${PODS_TARGET_SRCROOT}/.."
          PROJECT_ROOT="\${PROJECT_ROOT:-$PROJECT_DIR/../..}"
          RESOURCE_DEST="$CONFIGURATION_BUILD_DIR/EXConstants.bundle"
          if [ "$BUNDLE_FORMAT" = "deep" ]; then
            RESOURCE_DEST="$RESOURCE_DEST/Contents/Resources"
          fi
          mkdir -p "$RESOURCE_DEST"
          "$PACKAGE_DIR/scripts/with-node.sh" "$PACKAGE_DIR/scripts/getAppConfig.js" "$PROJECT_ROOT" "$RESOURCE_DEST"
        SCRIPT
      end
    end
    # Xcode 27 rejects dependency targets older than its supported iOS range.
    minimum_ios = Gem::Version.new(podfile_properties['ios.deploymentTarget'] || '15.1')
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current && Gem::Version.new(current) < minimum_ios
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = minimum_ios.to_s
        end
      end
    end
`;
    config.modResults.contents = config.modResults.contents.replace(anchor, anchor + block);
    return config;
  });
};
