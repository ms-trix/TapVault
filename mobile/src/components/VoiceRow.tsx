import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Mic, Square } from 'lucide-react-native';
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

  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.mic}>
            <Mic size={16} color={colors.ink} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>Voice note</Text>
            <Text style={styles.meta}>{meta}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {voiceUri && !recording ? (
            <Pressable onPress={onClear} hitSlop={8}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={onToggle}
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.85 }]}
          >
            {recording ? <Square size={14} color={colors.ink} /> : <Mic size={14} color={colors.ink} />}
            <Text style={styles.btnLabel}>
              {recording ? 'Stop' : voiceUri ? 'Re-record' : 'Record'}
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
    padding: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  mic: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.butter,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flexShrink: 1 },
  title: { fontSize: 13, fontWeight: '600', color: colors.ink },
  meta: { fontSize: 11, color: colors.muteSoft, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 },
  remove: { fontSize: 12, color: colors.muteSoft, fontWeight: '600', paddingHorizontal: 4 },
  btn: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cream,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnLabel: { fontSize: 12, fontWeight: '600', color: colors.ink },
  error: { fontSize: 11, color: '#9b3b3b', lineHeight: 16 },
});
