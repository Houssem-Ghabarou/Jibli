/**
 * fix-ndk27.js
 *
 * NDK 27 (LLVM 18) changed the C++ ABI — libc++ symbols now require explicit
 * linkage to c++_shared in each native module's CMakeLists.txt.
 * This script patches all affected libraries so the project builds on NDK 27.
 *
 * Run automatically via the "postinstall" npm script.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NM = path.join(ROOT, 'node_modules');

const patches = [
  // react-native-screens (main)
  {
    file: path.join(NM, 'react-native-screens/android/CMakeLists.txt'),
    find: '            ReactAndroid::jsi\n            fbjni::fbjni\n            android\n        )',
    replace: '            ReactAndroid::jsi\n            fbjni::fbjni\n            android\n            c++_shared\n        )',
  },
  // react-native-screens (jni)
  {
    file: path.join(NM, 'react-native-screens/android/src/main/jni/CMakeLists.txt'),
    find: '    ReactAndroid::reactnative\n    ReactAndroid::jsi\n    fbjni::fbjni\n  )',
    replace: '    ReactAndroid::reactnative\n    ReactAndroid::jsi\n    fbjni::fbjni\n    c++_shared\n  )',
  },
  // expo-modules-core (main)
  {
    file: path.join(NM, 'expo-modules-core/android/CMakeLists.txt'),
    find: 'target_link_libraries(\n  ${PACKAGE_NAME}\n  ReactAndroid::reactnative\n)',
    replace: 'target_link_libraries(\n  ${PACKAGE_NAME}\n  ReactAndroid::reactnative\n  c++_shared\n)',
  },
  // expo-modules-core (fabric)
  {
    file: path.join(NM, 'expo-modules-core/android/src/fabric/CMakeLists.txt'),
    find: 'target_link_libraries(fabric ReactAndroid::reactnative)',
    replace: 'target_link_libraries(fabric ReactAndroid::reactnative c++_shared)',
  },
  // react-native-gesture-handler
  {
    file: path.join(NM, 'react-native-gesture-handler/android/src/main/jni/CMakeLists.txt'),
    find: '  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n)',
    replace: '  ReactAndroid::reactnative\n  ReactAndroid::jsi\n  fbjni::fbjni\n  c++_shared\n)',
  },
  // react-native-reanimated
  {
    file: path.join(NM, 'react-native-reanimated/android/CMakeLists.txt'),
    find: 'target_link_libraries(reanimated log ReactAndroid::jsi fbjni::fbjni android\n                      worklets)',
    replace: 'target_link_libraries(reanimated log ReactAndroid::jsi fbjni::fbjni android\n                      worklets c++_shared)',
  },
  // react-native-safe-area-context
  {
    file: path.join(NM, 'react-native-safe-area-context/android/src/main/jni/CMakeLists.txt'),
    find: '          fbjni\n          jsi\n          reactnative\n  )',
    replace: '          fbjni\n          jsi\n          reactnative\n          c++_shared\n  )',
  },
];

let applied = 0;
let skipped = 0;
let missing = 0;

for (const { file, find, replace } of patches) {
  if (!fs.existsSync(file)) {
    console.log(`[fix-ndk27] SKIP (not found): ${path.relative(ROOT, file)}`);
    missing++;
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('c++_shared')) {
    skipped++;
    continue;
  }
  if (!content.includes(find)) {
    console.warn(`[fix-ndk27] WARNING: pattern not found in ${path.relative(ROOT, file)}`);
    missing++;
    continue;
  }
  fs.writeFileSync(file, content.replace(find, replace));
  console.log(`[fix-ndk27] Patched: ${path.relative(ROOT, file)}`);
  applied++;
}

if (applied > 0) {
  console.log(`[fix-ndk27] Applied ${applied} patch(es). NDK 27 compatibility restored.`);
} else if (skipped > 0 && missing === 0) {
  console.log(`[fix-ndk27] All NDK 27 patches already applied.`);
}
