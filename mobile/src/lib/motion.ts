import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/** Native driver glitches on Expo web — only enable on iOS/Android. */
export const NATIVE_DRIVER = Platform.OS !== 'web';

/** Prefer static Soft Keepsake motion when the system asks for reduced motion. */
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled?.()?.then((enabled) => {
      if (alive) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduceMotion);
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);

  return reduceMotion;
}
