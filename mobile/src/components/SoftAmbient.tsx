import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/** Static soft blobs — animated motes were janky on Expo web. */
export function SoftAmbient() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap]}>
      <View style={[styles.mote, styles.a]} />
      <View style={[styles.mote, styles.b]} />
      <View style={[styles.mote, styles.c]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  mote: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.butter,
  },
  a: { width: 140, height: 140, left: -24, top: 48, opacity: 0.16 },
  b: { width: 110, height: 110, right: -18, top: 220, opacity: 0.12 },
  c: { width: 90, height: 90, left: 120, bottom: 40, opacity: 0.1 },
});
