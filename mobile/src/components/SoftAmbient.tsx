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
  a: { width: 160, height: 160, left: -36, top: 40, opacity: 0.1 },
  b: { width: 120, height: 120, right: -28, top: 210, opacity: 0.08 },
  c: { width: 100, height: 100, left: 130, bottom: 36, opacity: 0.06 },
});
