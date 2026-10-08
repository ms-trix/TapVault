import { useEffect, useRef, useState } from "react";
import { Animated, AppState, Easing, StyleSheet, Text, View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { NfcMark } from "../components/NfcMark";
import { FooterRail } from "../components/PaperSurface";
import { GhostLink, KeepsakeButton } from "../components/ui";
import { NATIVE_DRIVER } from "../lib/motion";
import { formatCountdown, formatUnlockLabel, isUnlocked, remainingMs } from "../lib/unlock";
import { colors, fonts, radii, space, type } from "../theme";
import type { Note } from "../types";

type Props = {
  note: Note;
  opening: boolean;
  onOpen: () => void;
  onBack: () => void;
};

export function LockedScreen({ note, opening, onOpen, onBack }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.9)).current;
  const rise = useRef(new Animated.Value(12)).current;
  const [now, setNow] = useState(() => Date.now());

  const unlocked = isUnlocked(note.unlockAt, now);
  const left = note.unlockAt && !unlocked ? remainingMs(note.unlockAt, now) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 8,
        tension: 68,
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]).start();
  }, [emblemScale, opacity, rise]);

  useEffect(() => {
    if (!opening) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 360,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(emblemScale, {
        toValue: 1.1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(rise, {
        toValue: -8,
        duration: 360,
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]).start();
  }, [emblemScale, opening, opacity, rise]);

  useEffect(() => {
    if (!note.unlockAt || unlocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [note.unlockAt, unlocked]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") setNow(Date.now());
    });
    return () => sub.remove();
  }, []);

  const metaBits = [
    `For ${note.recipient}`,
    `From ${note.from}`,
    note.photoUri ? "Photo" : null,
    note.voiceUri ? "Voice" : null,
  ].filter(Boolean);

  const readyStrong = unlocked
    ? "Ready to open"
    : note.unlockAt
      ? `Sealed until ${formatUnlockLabel(note.unlockAt)}`
      : "Ready to open";

  const readyMute = unlocked
    ? note.voiceUri || note.photoUri
      ? [note.photoUri && "Photo", note.voiceUri && "Voice"].filter(Boolean).join(" + ")
      : `For ${note.recipient}`
    : note.unlockAt
      ? formatCountdown(left, note.unlockAt)
      : `For ${note.recipient}`;

  const ctaLabel = opening
    ? "Opening…"
    : unlocked
      ? "Open the note"
      : note.unlockAt
        ? left >= 24 * 60 * 60 * 1000
          ? `Opens ${formatUnlockLabel(note.unlockAt)}`
          : `Opens in ${formatCountdown(left, note.unlockAt)}`
        : "Open the note";

  return (
    <View style={styles.body}>
      <Animated.View style={[styles.main, { opacity, transform: [{ translateY: rise }] }]}>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{metaBits.join(" · ")}</Text>
        </View>
        <Animated.View
          style={[styles.emblem, { transform: [{ rotate: "-4deg" }, { scale: emblemScale }] }]}
        >
          <View style={styles.emblemInner}>
            <NfcMark size={52} />
          </View>
        </Animated.View>
        <Text style={styles.title}>Still sealed.</Text>
        {!unlocked && note.unlockAt ? (
          <>
            <Text style={styles.countdown}>{formatCountdown(left, note.unlockAt)}</Text>
            <Text style={styles.countdownSub}>Opens {formatUnlockLabel(note.unlockAt)}</Text>
          </>
        ) : null}
        <Text style={styles.teaser}>
          {unlocked
            ? `A few words are waiting here, just for ${note.recipient}.`
            : "A note is waiting — it can’t be opened yet."}
        </Text>
      </Animated.View>
      <Animated.View style={{ opacity }}>
        <FooterRail style={styles.footer}>
          <View style={styles.readyRow}>
            <Text style={styles.readyStrong}>{readyStrong}</Text>
            <Text style={styles.readyMute}>{readyMute}</Text>
          </View>
          <KeepsakeButton
            label={ctaLabel}
            onPress={onOpen}
            disabled={opening || !unlocked}
            trailing={<ArrowRight size={16} color={colors.cream} />}
          />
          <GhostLink label="Back to start" onPress={onBack} />
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
    paddingHorizontal: 8,
  },
  meta: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.paper,
  },
  metaText: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.muteSoft,
    textAlign: "center",
  },
  emblem: {
    width: 120,
    height: 120,
    marginVertical: 32,
    borderRadius: radii.tag,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: "center",
    justifyContent: "center",
  },
  emblemInner: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.ink}14`,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...type.displayHero,
    color: colors.ink,
    marginBottom: 12,
  },
  countdown: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.4,
    color: colors.ink,
    marginBottom: 4,
  },
  countdownSub: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muteSoft,
    marginBottom: 12,
  },
  teaser: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    color: colors.muteSoft,
    textAlign: "center",
    maxWidth: 280,
    paddingBottom: space.sm,
  },
  footer: {
    marginHorizontal: -26,
    paddingHorizontal: 26,
    alignItems: "center",
  },
  readyRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    gap: 8,
  },
  readyStrong: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    color: colors.ink,
    flexShrink: 1,
  },
  readyMute: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
  },
});
