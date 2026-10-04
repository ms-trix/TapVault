import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mic } from 'lucide-react-native';
import { colors } from '../theme';
import { formatDuration } from '../lib/voice';

type Props = {
  recording: boolean;
  recordSec: number;
  voiceUri?: string;
  voiceDurationSec?: number;
  error?: string | null;
  onToggle: () => void;
  onClear: () => void;
};

export function VoiceRow({
  recording,
  recordSec,
  voiceUri,
  voiceDurationSec,
  error,
  onToggle,
  onClear,
}: Props) {
  const meta = recording
    ? `Recording ${formatDuration(recordSec)}`
    : voiceUri
      ? `Saved · ${formatDuration(voiceDurationSec ?? 0)}`
      : 'Optional · up to 30 seconds';

  const label = recording ? 'Stop' : voiceUri ? 'Re-record' : 'Record';

  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={[styles.badge, recording && styles.badgeLive, voiceUri && !recording && styles.badgeSaved]}>
            {recording ? <View style={styles.liveDot} /> : <Mic size={15} color={colors.ink} />}
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>Voice note</Text>
            <Text style={[styles.meta, recording && styles.metaLive]}>{meta}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {voiceUri && !recording ? (
            <Pressable onPress={onClear} hitSlop={10} style={styles.removeHit}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onToggle}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [
              styles.btn,
              recording ? styles.btnStop : voiceUri ? styles.btnRerecord : styles.btnRecord,
              pressed && { opacity: 0.88 },
            ]}
          >
            {recording ? (
              <View style={styles.stopGlyph} />
            ) : (
              <Mic size={14} color={voiceUri ? colors.ink : colors.cream} strokeWidth={2.25} />
            )}
            <Text
              style={[
                styles.btnLabel,
                recording || voiceUri ? styles.btnLabelInk : styles.btnLabelCream,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.softLine,
    borderRadius: 2,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 11, flex: 1, minWidth: 0 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.butter,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  badgeSaved: {
    backgroundColor: colors.butterDeep,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.butter,
  },
  copy: { flexShrink: 1 },
  title: { fontSize: 13, fontWeight: '600', color: colors.ink },
  meta: { fontSize: 11, color: colors.muteSoft, marginTop: 2 },
  metaLive: { color: colors.ink, fontWeight: '600' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 0 },
  removeHit: { paddingVertical: 6, paddingHorizontal: 2 },
  remove: { fontSize: 12, color: colors.muteSoft, fontWeight: '600' },
  btn: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 3,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  btnRecord: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  btnRerecord: {
    backgroundColor: colors.cream,
    borderColor: colors.ink,
  },
  btnStop: {
    backgroundColor: colors.butter,
    borderColor: colors.ink,
  },
  stopGlyph: {
    width: 11,
    height: 11,
    borderRadius: 2,
    backgroundColor: colors.ink,
  },
  btnLabel: { fontSize: 12, fontWeight: '600' },
  btnLabelCream: { color: colors.cream },
  btnLabelInk: { color: colors.ink },
  error: { fontSize: 11, color: '#9b3b3b', lineHeight: 16 },
});
