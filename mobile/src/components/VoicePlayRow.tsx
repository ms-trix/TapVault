import { Pressable, StyleSheet, Text, View } from "react-native";
import { Mic, Pause, Play } from "lucide-react-native";
import { colors, fonts, radii } from "../theme";
import { formatDuration } from "../lib/voice";

type Props = {
  durationSec?: number;
  playing: boolean;
  onToggle: () => void;
};

/** Reveal-screen voice control — same paper box language as Seal VoiceRow. */
export function VoicePlayRow({ durationSec, playing, onToggle }: Props) {
  const label = playing ? "Pause" : "Play";

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.badge, playing && styles.badgeLive]}>
          {playing ? <View style={styles.liveDot} /> : <Mic size={15} color={colors.ink} />}
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Voice note</Text>
          <Text style={[styles.meta, playing && styles.metaLive]}>
            {playing ? "Playing…" : `Saved · ${formatDuration(durationSec ?? 0)}`}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.btn,
          playing ? styles.btnPause : styles.btnPlay,
          pressed && styles.btnPressed,
        ]}
      >
        {playing ? (
          <Pause size={14} color={colors.ink} strokeWidth={2.25} fill={colors.ink} />
        ) : (
          <Play size={14} color={colors.cream} strokeWidth={2.25} fill={colors.cream} />
        )}
        <Text style={[styles.btnLabel, playing ? styles.btnLabelInk : styles.btnLabelCream]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 28,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.softLine,
    borderRadius: radii.hair,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 11, flex: 1, minWidth: 0 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.butter,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeLive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.butter,
  },
  copy: { flexShrink: 1 },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
    marginTop: 2,
  },
  metaLive: { color: colors.ink, fontFamily: fonts.sansSemi },
  btn: {
    minHeight: 40,
    minWidth: 98,
    paddingHorizontal: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    flexShrink: 0,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  btnPlay: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  btnPause: {
    backgroundColor: colors.butter,
    borderColor: colors.ink,
  },
  btnLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
  btnLabelCream: { color: colors.cream },
  btnLabelInk: { color: colors.ink },
});
