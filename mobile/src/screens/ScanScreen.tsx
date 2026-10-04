import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Check, ScanLine } from 'lucide-react-native';
import { NfcMark } from '../components/NfcMark';
import { FooterRail } from '../components/PaperSurface';
import { GhostLink, KeepsakeButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { colors, fonts, radii, space, timing, type } from '../theme';
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
  const copyOpacity = useRef(new Animated.Value(1)).current;
  const active = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    active.current.forEach((a) => a.stop());
    active.current = [];

    ringPulse.setValue(0);
    sweep.setValue(0);
    ringSettle.setValue(phase === 'found' ? 1 : 0);
    tagScale.setValue(1);
    checkOpacity.setValue(0);

    Animated.sequence([
      Animated.timing(copyOpacity, {
        toValue: 0.35,
        duration: 90,
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(copyOpacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]).start();

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
  }, [phase, ringPulse, sweep, ringSettle, tagScale, checkOpacity, copyOpacity]);

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
            <NfcMark size={34} />
            {phase === 'found' ? (
              <Animated.View style={[styles.success, { opacity: checkOpacity }]}>
                <Check size={12} color={colors.cream} strokeWidth={2.5} />
              </Animated.View>
            ) : null}
          </Animated.View>
        </View>
        <Animated.View style={styles.copy}>
          <Animated.View style={{ opacity: copyOpacity, alignItems: 'center' }}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </Animated.View>
        </Animated.View>
      </View>
      <FooterRail style={styles.footer}>
        <KeepsakeButton
          label={cta}
          onPress={onDemoTag}
          disabled={phase !== 'listening'}
          leading={<ScanLine size={17} color={colors.cream} />}
          trailing={<ArrowRight size={17} color={colors.cream} />}
        />
        <GhostLink label="Leave a note" onPress={onLeaveNote} />
      </FooterRail>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  stage: {
    width: 228,
    height: 228,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  ring: {
    position: 'absolute',
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.softLine,
  },
  ringOuter: {
    width: 216,
    height: 216,
  },
  ringInner: {
    width: 152,
    height: 152,
    borderColor: colors.border,
    opacity: 0.75,
  },
  sweep: {
    position: 'absolute',
    width: 216,
    height: 216,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderTopColor: colors.ink,
    borderRightColor: `${colors.ink}33`,
  },
  tag: {
    width: 78,
    height: 78,
    borderRadius: radii.tag,
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
  copy: {
    minHeight: 110,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    ...type.displayTitle,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: space.sm,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muteSoft,
    textAlign: 'center',
    maxWidth: 280,
  },
  footer: {
    marginHorizontal: -26,
    paddingHorizontal: 26,
    alignItems: 'center',
  },
});
