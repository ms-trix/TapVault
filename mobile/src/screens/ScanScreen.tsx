import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Check, ScanLine } from 'lucide-react-native';
import { NfcMark } from '../components/NfcMark';
import { SoftAmbient } from '../components/SoftAmbient';
import { GhostLink, KeepsakeButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { colors, timing } from '../theme';
import type { ScanPhase } from '../types';

type Props = {
  phase: ScanPhase;
  onDemoTag: () => void;
  onLeaveNote: () => void;
};

export function ScanScreen({ phase, onDemoTag, onLeaveNote }: Props) {
  const outerPulse = useRef(new Animated.Value(0)).current;
  const innerPulse = useRef(new Animated.Value(0)).current;
  const fill = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const tagScale = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const active = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    active.current.forEach((a) => a.stop());
    active.current = [];

    outerPulse.setValue(0);
    innerPulse.setValue(0);
    fill.setValue(0);
    spin.setValue(0);
    ripple.setValue(0);
    tagScale.setValue(1);

    if (phase === 'listening') {
      const breathe = (value: Animated.Value, duration: number, delay = 0) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(value, {
              toValue: 1,
              duration: duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: NATIVE_DRIVER,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: duration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: NATIVE_DRIVER,
            }),
          ]),
        );

      const outer = breathe(outerPulse, 4200);
      const inner = breathe(innerPulse, 4200, 350);
      const tag = Animated.loop(
        Animated.sequence([
          Animated.timing(tagScale, {
            toValue: 1.05,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(tagScale, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          }),
        ]),
      );
      active.current = [outer, inner, tag];
      outer.start();
      inner.start();
      tag.start();
      return () => active.current.forEach((a) => a.stop());
    }

    if (phase === 'detecting') {
      const duration = timing.detectMs;
      const run = Animated.parallel([
        Animated.timing(fill, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(spin, {
          toValue: 1,
          duration,
          easing: Easing.bezier(0.2, 0.7, 0.25, 1),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.sequence([
          Animated.timing(tagScale, {
            toValue: 0.92,
            duration: duration * 0.35,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(tagScale, {
            toValue: 0.92,
            duration: duration * 0.37,
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(tagScale, {
            toValue: 1,
            duration: duration * 0.28,
            useNativeDriver: NATIVE_DRIVER,
          }),
        ]),
        Animated.timing(ripple, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]);
      active.current = [run];
      run.start();
      return () => active.current.forEach((a) => a.stop());
    }

    // found — rings stay filled; tag pops
    fill.setValue(1);
    const pop = Animated.spring(tagScale, {
      toValue: 1.06,
      friction: 7,
      tension: 80,
      useNativeDriver: NATIVE_DRIVER,
    });
    active.current = [pop];
    pop.start();
    return () => active.current.forEach((a) => a.stop());
  }, [phase, outerPulse, innerPulse, fill, spin, tagScale, ripple]);

  const listeningScale = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });
  const listeningOpacity = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  const fillScale = fill.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.92, 1.015, 1],
  });
  const fillOpacity = fill.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.25, 1, 1],
  });

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['-120deg', '520deg'],
  });
  const traceOpacity = spin.interpolate({
    inputRange: [0, 0.14, 0.86, 1],
    outputRange: [0, 1, 1, 0],
  });

  const rippleScale = ripple.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.8],
  });
  const rippleOpacity = ripple.interpolate({
    inputRange: [0, 0.12, 1],
    outputRange: [0, 0.7, 0],
  });

  const title =
    phase === 'found' ? 'Note found.' : phase === 'detecting' ? 'Reading the tag…' : 'Hold a tag\nto your phone.';
  const subtitle =
    phase === 'found'
      ? 'Ready to open.'
      : phase === 'detecting'
        ? 'Finding the note inside.'
        : 'A little note, waiting to be opened.';
  const cta =
    phase === 'found' ? 'Tag found' : phase === 'detecting' ? 'Reading tag…' : 'Use demo tag';

  return (
    <View style={styles.body}>
      <SoftAmbient />
      <View style={styles.main}>
        <View style={styles.stage}>
          <Animated.View
            style={[
              styles.orbit,
              styles.orbitOuter,
              phase === 'listening' && {
                transform: [{ scale: listeningScale(outerPulse) }],
                opacity: listeningOpacity(outerPulse),
              },
              phase === 'detecting' && {
                transform: [{ scale: fillScale }],
                opacity: fillOpacity,
                borderColor: colors.ink,
              },
              phase === 'found' && { borderColor: colors.ink, opacity: 1 },
            ]}
          />
          <Animated.View
            style={[
              styles.orbit,
              styles.orbitInner,
              phase === 'listening' && {
                transform: [{ scale: listeningScale(innerPulse) }],
                opacity: listeningOpacity(innerPulse),
              },
              phase === 'detecting' && {
                transform: [{ scale: fillScale }],
                opacity: fillOpacity,
                borderColor: colors.ink,
              },
              phase === 'found' && { borderColor: colors.butterDeep, opacity: 1 },
            ]}
          />
          {phase === 'detecting' ? (
            <Animated.View
              style={[styles.trace, { opacity: traceOpacity, transform: [{ rotate }] }]}
            />
          ) : null}
          <Animated.View style={[styles.tag, { transform: [{ rotate: '-6deg' }, { scale: tagScale }] }]}>
            {phase === 'detecting' ? (
              <Animated.View
                style={[
                  styles.ripple,
                  { opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
                ]}
              />
            ) : null}
            <NfcMark size={34} />
            {phase === 'found' ? (
              <View style={styles.success}>
                <Check size={14} color={colors.cream} />
              </View>
            ) : null}
          </Animated.View>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.footer}>
        <KeepsakeButton
          label={cta}
          onPress={onDemoTag}
          disabled={phase !== 'listening'}
          leading={<ScanLine size={18} color={colors.cream} />}
          trailing={<ArrowRight size={18} color={colors.cream} />}
        />
        <GhostLink label="Leave a note →" onPress={onLeaveNote} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, position: 'relative' },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    zIndex: 1,
  },
  stage: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  orbit: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orbitOuter: { width: '98%', height: '98%' },
  orbitInner: {
    width: '72%',
    height: '72%',
    borderStyle: 'dashed',
    borderColor: colors.butterDeep,
  },
  trace: {
    position: 'absolute',
    width: '98%',
    height: '98%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.ink,
  },
  tag: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.butterDeep,
  },
  success: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 40,
    lineHeight: 44,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muteSoft,
    textAlign: 'center',
    maxWidth: 270,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
    gap: 10,
    alignItems: 'center',
    zIndex: 1,
  },
});
