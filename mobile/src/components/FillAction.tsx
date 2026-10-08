import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { NATIVE_DRIVER } from "../lib/motion";
import { colors, fonts, radii, timing } from "../theme";

type Props = {
  title: string;
  subtitle: string;
  leading?: ReactNode;
  leadingInk?: ReactNode;
  disabled?: boolean;
  reduceMotion?: boolean;
  /** Tall tiles that share leftover vertical space (entrance). */
  fillHeight?: boolean;
  onPress: () => void;
};

const FILL_MS = 280;

export function FillAction({
  title,
  subtitle,
  leading,
  leadingInk,
  disabled,
  reduceMotion,
  fillHeight,
  onPress,
}: Props) {
  const fill = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [busy, setBusy] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);

  useEffect(
    () => () => {
      fill.stopAnimation();
      scale.stopAnimation();
    },
    [fill, scale],
  );

  const handlePress = () => {
    if (disabled || busy) return;
    setBusy(true);

    if (reduceMotion) {
      onPress();
      return;
    }

    Animated.parallel([
      Animated.timing(fill, {
        toValue: 1,
        duration: FILL_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.985,
          duration: timing.pressMs,
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: timing.pressMs,
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]),
    ]).start(({ finished }) => {
      if (finished) onPress();
      else setBusy(false);
    });
  };

  const inkSlide = fill.interpolate({
    inputRange: [0, 1],
    outputRange: [-(rowWidth || 320), 0],
  });

  const inkOpacity = fill.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 1, 1],
  });

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || busy}
      onPress={handlePress}
      style={({ pressed }) => [pressed && !busy && !disabled && { opacity: 0.96 }]}
    >
      <Animated.View
        style={[styles.row, { transform: [{ scale }] }]}
        onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
      >
        <View style={[styles.clip, fillHeight && styles.clipTall]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ink,
              {
                opacity: inkOpacity,
                transform: [{ translateX: inkSlide }],
              },
            ]}
          />
          <View style={[styles.content, fillHeight && styles.contentTall]}>
            {leading ? (
              <View style={[styles.leading, fillHeight && styles.leadingTall]}>{leading}</View>
            ) : null}
            <View style={styles.copy}>
              <Text style={[styles.title, fillHeight && styles.titleTall]}>{title}</Text>
              <Text style={[styles.subtitle, fillHeight && styles.subtitleTall]}>{subtitle}</Text>
            </View>
            <Text style={[styles.arrow, fillHeight && styles.arrowTall]}>→</Text>
          </View>
          <Animated.View
            pointerEvents="none"
            style={[styles.content, fillHeight && styles.contentTall, styles.contentInk, { opacity: fill }]}
          >
            {leadingInk || leading ? (
              <View style={[styles.leading, fillHeight && styles.leadingTallInk]}>
                {leadingInk ?? leading}
              </View>
            ) : null}
            <View style={styles.copy}>
              <Text style={[styles.title, fillHeight && styles.titleTall, styles.titleInk]}>
                {title}
              </Text>
              <Text
                style={[styles.subtitle, fillHeight && styles.subtitleTall, styles.subtitleInk]}
              >
                {subtitle}
              </Text>
            </View>
            <Text style={[styles.arrow, fillHeight && styles.arrowTall, styles.arrowInk]}>→</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    overflow: "hidden",
  },
  clip: {
    overflow: "hidden",
    minHeight: 72,
    justifyContent: "center",
  },
  clipTall: {
    minHeight: 108,
  },
  ink: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.ink,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  contentTall: {
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 14,
  },
  contentInk: {
    ...StyleSheet.absoluteFill,
  },
  leading: {
    width: 28,
    alignItems: "center",
  },
  leadingTall: {
    width: 40,
    height: 40,
    borderRadius: radii.control,
    backgroundColor: "rgba(230, 213, 154, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  leadingTallInk: {
    width: 40,
    height: 40,
    borderRadius: radii.control,
    backgroundColor: "rgba(250, 246, 235, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: 2 },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 15,
    color: colors.ink,
  },
  titleTall: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.15,
  },
  titleInk: { color: colors.cream },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 17,
    color: colors.muteSoft,
  },
  subtitleTall: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  subtitleInk: { color: `${colors.cream}B8` },
  arrow: {
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.muteSoft,
  },
  arrowTall: {
    fontSize: 18,
  },
  arrowInk: { color: `${colors.cream}C0` },
});
