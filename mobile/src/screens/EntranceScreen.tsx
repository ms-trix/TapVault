import { useEffect, useRef } from "react";
import { Alert, Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Pencil, ScanLine } from "lucide-react-native";
import { FillAction } from "../components/FillAction";
import { NATIVE_DRIVER } from "../lib/motion";
import { colors, fonts, space, timing, type } from "../theme";

type Props = {
  reduceMotion?: boolean;
  continuityAssemble?: boolean;
  onMarkReady?: () => void;
  onAssembleDone?: () => void;
  onScan: () => void;
  onLeaveNote: () => void;
  onResetDemo: () => void;
};

export function EntranceScreen({
  reduceMotion = false,
  continuityAssemble = false,
  onMarkReady,
  onAssembleDone,
  onScan,
  onLeaveNote,
  onResetDemo,
}: Props) {
  const copyReveal = useRef(new Animated.Value(continuityAssemble ? 0 : 1)).current;
  const actionsReveal = useRef(new Animated.Value(continuityAssemble ? 0 : 1)).current;
  const assembleStarted = useRef(false);
  const onMarkReadyRef = useRef(onMarkReady);
  const onAssembleDoneRef = useRef(onAssembleDone);
  onMarkReadyRef.current = onMarkReady;
  onAssembleDoneRef.current = onAssembleDone;

  useEffect(() => {
    if (!continuityAssemble || assembleStarted.current) {
      if (!continuityAssemble) {
        requestAnimationFrame(() => onMarkReadyRef.current?.());
      }
      return;
    }
    assembleStarted.current = true;

    requestAnimationFrame(() => {
      onMarkReadyRef.current?.();
    });

    if (reduceMotion) {
      copyReveal.setValue(1);
      actionsReveal.setValue(1);
      onAssembleDoneRef.current?.();
      return;
    }

    const assemble = Animated.stagger(50, [
      Animated.timing(copyReveal, {
        toValue: 1,
        duration: timing.enterMs,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(actionsReveal, {
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
  }, [actionsReveal, continuityAssemble, copyReveal, reduceMotion]);

  const rise = copyReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [reduceMotion ? 0 : 10, 0],
  });
  const actionsRise = actionsReveal.interpolate({
    inputRange: [0, 1],
    outputRange: [reduceMotion ? 0 : 10, 0],
  });

  const handleReset = () => {
    Alert.alert("Reset demo note?", "Restores the sample sealed note on this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: onResetDemo },
    ]);
  };

  return (
    <View style={styles.body}>
      <Animated.View style={{ opacity: copyReveal, transform: [{ translateY: rise }] }}>
        <Text style={styles.heading}>What would you like to do?</Text>
        <Text style={styles.lede}>
          {"Scan a sealed note, or write one of your\u00a0own."}
        </Text>
      </Animated.View>
      <Animated.View
        style={[
          styles.actions,
          { opacity: actionsReveal, transform: [{ translateY: actionsRise }] },
        ]}
      >
        <FillAction
          fillHeight
          title="Scan a tag"
          subtitle="Hold a tag to open a sealed note"
          leading={<ScanLine size={20} color={colors.ink} />}
          leadingInk={<ScanLine size={20} color={colors.cream} />}
          reduceMotion={reduceMotion}
          onPress={onScan}
        />
        <FillAction
          fillHeight
          title="Leave a note"
          subtitle="Write, add a photo, set when it opens"
          leading={<Pencil size={19} color={colors.ink} />}
          leadingInk={<Pencil size={19} color={colors.cream} />}
          reduceMotion={reduceMotion}
          onPress={onLeaveNote}
        />
      </Animated.View>
      <Text style={styles.hint} onLongPress={handleReset}>
        Demo stays on this device · long-press here to reset
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingTop: space.sm },
  heading: {
    ...type.displayTitle,
    color: colors.ink,
    marginBottom: space.sm,
  },
  lede: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muteSoft,
    marginBottom: space.md,
  },
  actions: {
    gap: 12,
    marginTop: space.md,
  },
  hint: {
    marginTop: "auto",
    textAlign: "center",
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
    paddingBottom: space.sm,
  },
});
