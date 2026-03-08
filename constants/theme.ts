import { Platform } from 'react-native';

export const Colors = {
  accent: '#E8402A',
  accentLight: '#FF6B4A',
  background: '#FFFFFF',
  surface: '#F8F8F8',
  border: '#F0F0F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#888888',
  textMuted: '#BBBBBB',
  success: '#2ECC71',
  warning: '#F39C12',
  headerDark: '#1A1F3D',
  star: '#F4C542',
  white: '#FFFFFF',
  black: '#000000',

  light: {
    text: '#1A1A1A',
    background: '#FFFFFF',
    tint: '#E8402A',
    icon: '#888888',
    tabIconDefault: '#888888',
    tabIconSelected: '#E8402A',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#E8402A',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#E8402A',
  },
};

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
