import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

function Mote({
  style,
  duration,
  dx,
  dy,
}: {
  style: object;
  duration: number;
  dx: number;
  dy: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, duration]);

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, dy] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.mote, style, { transform: [{ translateX }, { translateY }] }]}
    />
  );
}

export function SoftAmbient() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Mote style={styles.a} duration={11000} dx={18} dy={22} />
      <Mote style={styles.b} duration={13000} dx={-16} dy={-14} />
      <Mote style={styles.c} duration={12000} dx={12} dy={-18} />
    </View>
  );
}

const styles = StyleSheet.create({
  mote: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.butter,
  },
  a: { width: 140, height: 140, left: -24, top: '12%', opacity: 0.18 },
  b: { width: 110, height: 110, right: -18, top: '48%', opacity: 0.14 },
  c: { width: 90, height: 90, left: '36%', bottom: '8%', opacity: 0.12 },
});
