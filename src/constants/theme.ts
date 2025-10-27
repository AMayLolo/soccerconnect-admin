// Remove: import { Platform } from 'react-native';

const isWeb = typeof window !== 'undefined';
const isIOS = isWeb ? false : process.platform === 'darwin';
const isAndroid = isWeb ? false : process.platform === 'android';

// Colors
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
