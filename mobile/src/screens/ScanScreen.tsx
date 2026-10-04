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
  const ringPulse = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const ringSettle = useRef(new Animated.Value(0)).current;
  const tagScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const active = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    active.current.forEach((a) => a.stop());
    active.current = [];

    ringPulse.setValue(0);
    sweep.setValue(0);
    ringSettle.setValue(phase === 'found' ? 1 : 0);
    tagScale.setValue(1);
    checkOpacity.setValue(0);

    if (phase === 'listening') {
      const ring = Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(ringPulse, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          }),
        ]),
      );
      const tag = Animated.loop(
        Animated.sequence([
          Animated.timing(tagScale, {
            toValue: 1.02,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(tagScale, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: NATIVE_DRIVER,
          }),
        ]),
      );
      active.current = [ring, tag];
      ring.start();
      tag.start();
      return () => active.current.forEach((a) => a.stop());
    }

    if (phase === 'detecting') {
      const duration = timing.detectMs;
      const run = Animated.parallel([
        Animated.timing(sweep, {
          toValue: 1,
          duration,
          easing: Easing.bezier(0.22, 0.72, 0.28, 1),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(ringSettle, {
          toValue: 1,
          duration: duration * 0.85,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.sequence([
          Animated.timing(tagScale, {
            toValue: 0.97,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: NATIVE_DRIVER,
          }),
          Animated.timing(tagScale, {
            toValue: 1,
            duration: duration - 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: NATIVE_DRIVER,
          }),
        ]),
      ]);
      active.current = [run];
      run.start();
      return () => active.current.forEach((a) => a.stop());
    }

    // found
    ringSettle.setValue(1);
    const settle = Animated.parallel([
      Animated.timing(tagScale, {
        toValue: 1.03,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 280,
        delay: 60,
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]);
    active.current = [settle];
    settle.start();
    return () => active.current.forEach((a) => a.stop());
  }, [phase, ringPulse, sweep, ringSettle, tagScale, checkOpacity]);

  const ringOpacity = ringPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.85],
  });
  const ringScale = ringPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.012],
  });

  const settleOpacity = ringSettle.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const rotate = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '270deg'],
  });
  const sweepOpacity = sweep.interpolate({
    inputRange: [0, 0.08, 0.88, 1],
    outputRange: [0, 0.9, 0.9, 0],
  });

  const title =
    phase === 'found'
      ? 'Note found.'
      : phase === 'detecting'
        ? 'Reading…'
        : 'Hold a tag\nto your phone.';
  const subtitle =
    phase === 'found'
      ? 'A sealed note is ready.'
      : phase === 'detecting'
        ? 'Opening the keepsake on this tag.'
        : 'Bring a TapVault tag close — or simulate one below.';
  const cta =
    phase === 'found' ? 'Opening…' : phase === 'detecting' ? 'Reading…' : 'Tap to simulate';

  const activeRing =
    phase === 'listening'
      ? { opacity: ringOpacity, transform: [{ scale: ringScale }] }
      : { opacity: settleOpacity };

  return (
    <View style={styles.body}>
      <SoftAmbient />
      <View style={styles.main}>
        <View style={styles.stage}>
          <Animated.View style={[styles.ring, styles.ringOuter, activeRing]} />
          <View style={[styles.ring, styles.ringInner]} />
          {phase === 'detecting' ? (
            <Animated.View
              style={[styles.sweep, { opacity: sweepOpacity, transform: [{ rotate }] }]}
            />
          ) : null}
          <Animated.View style={[styles.tag, { transform: [{ scale: tagScale }] }]}>
            <NfcMark size={32} />
            {phase === 'found' ? (
              <Animated.View style={[styles.success, { opacity: checkOpacity }]}>
                <Check size={12} color={colors.cream} strokeWidth={2.5} />
              </Animated.View>
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
          leading={<ScanLine size={17} color={colors.cream} />}
          trailing={<ArrowRight size={17} color={colors.cream} />}
        />
        <GhostLink label="Leave a note" onPress={onLeaveNote} />
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
    paddingHorizontal: 8,
    zIndex: 1,
  },
  stage: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.softLine,
  },
  ringOuter: {
    width: 188,
    height: 188,
  },
  ringInner: {
    width: 132,
    height: 132,
    borderColor: colors.border,
    opacity: 0.7,
  },
  sweep: {
    position: 'absolute',
    width: 188,
    height: 188,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderTopColor: colors.ink,
    borderRightColor: `${colors.ink}33`,
  },
  tag: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 36,
    lineHeight: 40,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muteSoft,
    textAlign: 'center',
    maxWidth: 260,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 20,
    gap: 8,
    alignItems: 'center',
    zIndex: 1,
  },
});
