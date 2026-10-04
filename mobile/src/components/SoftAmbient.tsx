import { StyleSheet, View } from 'react-native';
import { colors, surface } from '../theme';

/**
 * Static paper atmosphere — butter washes + motes.
 * Kept non-animated for Expo web stability.
 */
export function SoftAmbient() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.wrap]}>
      <View style={styles.washTop} />
      <View style={styles.washBottom} />
      <View style={[styles.mote, styles.a]} />
      <View style={[styles.mote, styles.b]} />
      <View style={[styles.mote, styles.c]} />
      <View style={[styles.mote, styles.d]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  washTop: {
    position: 'absolute',
    left: -40,
    right: -40,
    top: -60,
    height: 220,
    borderRadius: 180,
    backgroundColor: surface.washTop,
  },
  washBottom: {
    position: 'absolute',
    left: -20,
    right: -80,
    bottom: -80,
    height: 260,
    borderRadius: 200,
    backgroundColor: surface.washBottom,
  },
  mote: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.butter,
  },
  a: {
    width: 200,
    height: 200,
    left: -48,
    top: 72,
    opacity: surface.moteStrong,
  },
  b: {
    width: 150,
    height: 150,
    right: -40,
    top: 240,
    opacity: surface.moteMid,
  },
  c: {
    width: 120,
    height: 120,
    left: 100,
    bottom: 90,
    opacity: surface.moteSoft,
  },
  d: {
    width: 80,
    height: 80,
    right: 48,
    bottom: 200,
    opacity: surface.moteSoft,
  },
});
