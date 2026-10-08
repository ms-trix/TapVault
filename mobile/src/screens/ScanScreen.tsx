import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, ArrowRight, Check, ScanLine } from "lucide-react-native";
import { NfcMark } from "../components/NfcMark";
import { FooterRail } from "../components/PaperSurface";
import { GhostLink, KeepsakeButton } from "../components/ui";
import { NATIVE_DRIVER } from "../lib/motion";
import { colors, fonts, radii, space, timing, type } from "../theme";
import type { ScanMode, ScanPhase } from "../types";

type Props = {
  phase: ScanPhase;
  mode?: ScanMode;
  onDemoTag: () => void;
  onBack?: () => void;
  backDisabled?: boolean;
  error?: string | null;
  continuityAssemble?: boolean;
  reduceMotion?: boolean;
  onMarkReady?: () => void;
  onAssembleDone?: () => void;
};

function stopAnimations(active: React.MutableRefObject<Animated.CompositeAnimation[]>) {
  const list = active.current;
  if (!list) return;
  list.forEach((a) => a.stop());
  active.current = [];
}

export function ScanScreen({
  phase,
  mode = "read",
  onDemoTag,
  onBack,
  backDisabled,
  error,
  continuityAssemble = false,
  reduceMotion = false,
  onMarkReady,
  onAssembleDone,
}: Props) {
  const ringPulse = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const ringSettle = useRef(new Animated.Value(0)).current;
  const tagScale = useRef(new Animated.Value(1)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const copyOpacity = useRef(new Animated.Value(1)).current;
  const ringReveal = useRef(new Animated.Value(continuityAssemble ? 0 : 1)).current;
  const copyReveal = useRef(new Animated.Value(continuityAssemble ? 0 : 1)).current;
  const footerReveal = useRef(new Animated.Value(continuityAssemble ? 0 : 1)).current;
  const active = useRef<Animated.CompositeAnimation[]>([]);
  const assembleStarted = useRef(false);
  const onMarkReadyRef = useRef(onMarkReady);
  const onAssembleDoneRef = useRef(onAssembleDone);

  onMarkReadyRef.current = onMarkReady;
  onAssembleDoneRef.current = onAssembleDone;

  useEffect(() => {
    if (!continuityAssemble || assembleStarted.current) return;
    assembleStarted.current = true;

    requestAnimationFrame(() => {
      onMarkReadyRef.current?.();
    });

    if (reduceMotion) {
      ringReveal.setValue(1);
      copyReveal.setValue(1);
      footerReveal.setValue(1);
      onAssembleDoneRef.current?.();
      return;
    }

    const assemble = Animated.stagger(60, [
      Animated.timing(ringReveal, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(copyReveal, {
        toValue: 1,
        duration: timing.enterMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(footerReveal, {
        toValue: 1,
        duration: timing.enterMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]);

    assemble.start((result) => {
      if (result?.finished !== false) onAssembleDoneRef.current?.();
    });

    return () => assemble.stop();
  }, [continuityAssemble, reduceMotion, ringReveal, copyReveal, footerReveal]);

  useEffect(() => {
    stopAnimations(active);

    ringPulse.setValue(0);
    sweep.setValue(0);
    ringSettle.setValue(phase === "found" ? 1 : 0);
    tagScale.setValue(1);
    checkOpacity.setValue(0);

    if (!continuityAssemble) {
      Animated.sequence([
        Animated.timing(copyOpacity, {
          toValue: 0.35,
          duration: reduceMotion ? 0 : 90,
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(copyOpacity, {
          toValue: 1,
          duration: reduceMotion ? 0 : 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]).start();
    } else {
      copyOpacity.setValue(1);
    }

    if (phase === "listening") {
      if (reduceMotion || continuityAssemble) {
        return () => stopAnimations(active);
      }
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
      return () => stopAnimations(active);
    }

    if (phase === "detecting") {
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
      return () => stopAnimations(active);
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
    return () => stopAnimations(active);
  }, [
    phase,
    continuityAssemble,
    reduceMotion,
    ringPulse,
    sweep,
    ringSettle,
    tagScale,
    checkOpacity,
    copyOpacity,
  ]);

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
  const innerRingOpacity = ringReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.75],
  });
  const copyRise = copyReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [reduceMotion ? 0 : 10, 0],
  });

  const write = mode === "write";
  const title = write
    ? phase === "found"
      ? "Sealed to this tag."
      : phase === "detecting"
        ? "Sealing…"
        : "Hold a tag\nto seal this note"
    : phase === "found"
      ? "Note found."
      : phase === "detecting"
        ? "Reading…"
        : "Hold a tag\nto your phone.";
  const subtitle = write
    ? phase === "found"
      ? "Your note is on the tag."
      : phase === "detecting"
        ? "Writing the note to this tag."
        : "Your note is ready — tap to write it."
    : phase === "found"
      ? "A sealed note is ready."
      : phase === "detecting"
        ? "Opening the keepsake on this tag."
        : "Bring a TapVault tag close — or simulate one below.";
  const cta =
    phase === "found"
      ? write
        ? "Sealed"
        : "Opening…"
      : phase === "detecting"
        ? write
          ? "Sealing…"
          : "Reading…"
        : "Tap to simulate";

  const outerRingStyle = continuityAssemble
    ? { opacity: ringReveal }
    : phase === "listening"
      ? { opacity: ringOpacity, transform: [{ scale: ringScale }] }
      : { opacity: settleOpacity };

  return (
    <View style={styles.body}>
      <View style={styles.main}>
        <View style={styles.stage}>
          <Animated.View style={[styles.ring, styles.ringOuter, outerRingStyle]} />
          <Animated.View
            style={[
              styles.ring,
              styles.ringInner,
              { opacity: continuityAssemble ? innerRingOpacity : 0.75 },
            ]}
          />
          {phase === "detecting" ? (
            <Animated.View
              style={[
                styles.sweep,
                {
                  opacity: sweep.interpolate({
                    inputRange: [0, 0.08, 0.88, 1],
                    outputRange: [0, 0.9, 0.9, 0],
                  }),
                  transform: [
                    {
                      rotate: sweep.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["-90deg", "270deg"],
                      }),
                    },
                  ],
                },
              ]}
            />
          ) : null}
          <Animated.View
            style={[styles.tag, { transform: [{ rotate: "-6deg" }, { scale: tagScale }] }]}
          >
            <View style={styles.tagInner}>
              <NfcMark size={34} />
            </View>
            {phase === "found" ? (
              <Animated.View style={[styles.success, { opacity: checkOpacity }]}>
                <Check size={12} color={colors.cream} strokeWidth={2.5} />
              </Animated.View>
            ) : null}
          </Animated.View>
        </View>
        {continuityAssemble ? (
          <Animated.View
            style={[styles.copy, { opacity: copyReveal, transform: [{ translateY: copyRise }] }]}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.copy, { opacity: copyOpacity }]}>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </Animated.View>
        )}
      </View>
      <Animated.View style={{ opacity: continuityAssemble ? footerReveal : 1 }}>
        <FooterRail style={styles.footer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <KeepsakeButton
            label={cta}
            onPress={onDemoTag}
            disabled={phase !== "listening"}
            leading={<ScanLine size={17} color={colors.cream} />}
            trailing={<ArrowRight size={17} color={colors.cream} />}
          />
          {onBack ? (
            <GhostLink
              label={write ? "Back to editing" : "Back"}
              onPress={onBack}
              leading={<ArrowLeft size={15} color={backDisabled ? colors.border : colors.mute} />}
            />
          ) : null}
        </FooterRail>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  main: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  stage: {
    width: 228,
    height: 228,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.lg,
  },
  ring: {
    position: "absolute",
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
  },
  sweep: {
    position: "absolute",
    width: 216,
    height: 216,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: "transparent",
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
    alignItems: "center",
    justifyContent: "center",
  },
  tagInner: {
    transform: [{ rotate: "6deg" }],
  },
  success: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    minHeight: 110,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    ...type.displayTitle,
    color: colors.ink,
    textAlign: "center",
    marginBottom: space.sm,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muteSoft,
    textAlign: "center",
    maxWidth: 280,
  },
  footer: {
    marginHorizontal: -26,
    paddingHorizontal: 26,
    alignItems: "center",
  },
  error: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mute,
    textAlign: "center",
    marginBottom: 4,
  },
});
