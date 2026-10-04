import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ArrowRight, Check, ScanLine } from 'lucide-react-native';
import { NfcMark } from '../components/NfcMark';
import { SoftAmbient } from '../components/SoftAmbient';
import { GhostLink, KeepsakeButton } from '../components/ui';
import { colors } from '../theme';
import type { ScanPhase } from '../types';

type Props = {
  phase: ScanPhase;
  onDemoTag: () => void;
  onLeaveNote: () => void;
};

export function ScanScreen({ phase, onDemoTag, onLeaveNote }: Props) {
  const breathe = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    if (phase === 'listening') loop.start();
    else {
      loop.stop();
      breathe.setValue(0);
    }
    return () => loop.stop();
  }, [breathe, phase]);

  useEffect(() => {
    let spinLoop: Animated.CompositeAnimation | undefined;
    let pulseAnim: Animated.CompositeAnimation | undefined;
    if (phase === 'detecting') {
      spin.setValue(0);
      spinLoop = Animated.timing(spin, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      pulseAnim = Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]);
      spinLoop.start();
      pulseAnim.start();
    } else {
      spin.setValue(0);
      pulse.setValue(0);
    }
    return () => {
      spinLoop?.stop();
      pulseAnim?.stop();
    };
  }, [phase, pulse, spin]);

  const tagScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const detectScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['-120deg', '520deg'],
  });
  const orbitScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

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

  const liveScale = phase === 'detecting' ? detectScale : phase === 'listening' ? tagScale : 1.06;

  return (
    <View style={styles.body}>
      <SoftAmbient />
      <View style={styles.main}>
        <View style={styles.stage}>
          <Animated.View
            style={[
              styles.orbit,
              styles.orbitOuter,
              phase === 'detecting' && { transform: [{ scale: orbitScale }], borderColor: colors.ink },
              phase === 'found' && { borderColor: colors.ink },
            ]}
          />
          <Animated.View
            style={[
              styles.orbit,
              styles.orbitInner,
              phase === 'detecting' && { transform: [{ scale: orbitScale }], borderColor: colors.ink },
            ]}
          />
          {phase === 'detecting' ? (
            <Animated.View style={[styles.trace, { transform: [{ rotate }] }]} />
          ) : null}
          <Animated.View
            style={[
              styles.tag,
              { transform: [{ rotate: '-6deg' }, { scale: liveScale }] },
            ]}
          >
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
