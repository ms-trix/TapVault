import { Platform } from 'react-native';

/** Native driver glitches on Expo web — only enable on iOS/Android. */
export const NATIVE_DRIVER = Platform.OS !== 'web';
