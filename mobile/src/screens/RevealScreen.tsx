import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Plus, Square } from 'lucide-react-native';
import { SoftAmbient } from '../components/SoftAmbient';
import { KeepsakeButton, QuietButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { formatDuration, playVoice, stopVoicePlayback } from '../lib/voice';
import { colors } from '../theme';
import type { Note } from '../types';

type Props = {
  note: Note;
  onStartAgain: () => void;
  onNewNote: () => void;
};

export function RevealScreen({ note, onStartAgain, onNewNote }: Props) {
  const letter = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    letter.setValue(0);
    Animated.timing(letter, {
      toValue: 1,
      duration: 520,
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [letter, note.recipient, note.message]);

  useEffect(
    () => () => {
      void stopVoicePlayback();
    },
    [],
  );

  const toggleVoice = async () => {
    if (!note.voiceUri) return;
    if (playing) {
      await stopVoicePlayback();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await playVoice(note.voiceUri, () => setPlaying(false));
    } catch {
      setPlaying(false);
    }
  };

  return (
    <View style={styles.body}>
      <SoftAmbient />
      <ScrollView contentContainerStyle={styles.main} style={styles.scroll}>
        <Text style={styles.kicker}>From {note.from}</Text>
        <Text style={styles.heading}>For {note.recipient}.</Text>
        <Animated.View
          style={[
            styles.letter,
            {
              opacity: letter,
              transform: [
                {
                  translateY: letter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.message}>{note.message}</Text>
          <Text style={styles.signature}>{note.from}</Text>
          {note.voiceUri ? (
            <View style={styles.voice}>
              <Pressable
                onPress={() => void toggleVoice()}
                style={({ pressed }) => [styles.play, pressed && { opacity: 0.85 }]}
                accessibilityRole="button"
                accessibilityLabel={playing ? 'Stop voice note' : 'Play voice note'}
              >
                {playing ? (
                  <Square size={14} color={colors.cream} />
                ) : (
                  <Text style={styles.playTriangle}>▶</Text>
                )}
              </Pressable>
              <View>
                <Text style={styles.voiceTitle}>Voice note</Text>
                <Text style={styles.voiceMeta}>{formatDuration(note.voiceDurationSec ?? 0)}</Text>
              </View>
            </View>
          ) : null}
        </Animated.View>
        <Text style={styles.caption}>Opened by holding this gift</Text>
      </ScrollView>
      <View style={styles.footer}>
        <QuietButton
          label="Start again"
          onPress={onStartAgain}
          leading={<ArrowLeft size={16} color={colors.ink} />}
        />
        <View style={styles.footerBtn}>
          <KeepsakeButton
            label="New note"
            onPress={onNewNote}
            leading={<Plus size={16} color={colors.cream} />}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, position: 'relative' },
  scroll: { zIndex: 1 },
  main: { paddingTop: 20, paddingBottom: 16 },
  kicker: { fontSize: 12, color: colors.muteSoft },
  heading: {
    fontFamily: 'Georgia',
    fontSize: 44,
    lineHeight: 46,
    color: colors.ink,
    marginTop: 10,
    marginBottom: 22,
  },
  letter: {
    borderWidth: 1,
    borderColor: colors.softLine,
    backgroundColor: colors.paper,
    paddingHorizontal: 28,
    paddingVertical: 30,
    minHeight: 280,
  },
  message: {
    fontSize: 19,
    lineHeight: 30,
    color: colors.ink,
  },
  signature: {
    fontFamily: 'Georgia',
    fontSize: 27,
    color: colors.ink,
    marginTop: 36,
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.softLine,
  },
  play: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: { color: colors.cream, fontSize: 14, marginLeft: 2 },
  voiceTitle: { fontSize: 13, fontWeight: '600', color: colors.ink },
  voiceMeta: { fontSize: 11, color: colors.muteSoft, marginTop: 2 },
  caption: {
    textAlign: 'center',
    color: colors.muteSoft,
    fontSize: 11,
    marginTop: 16,
  },
  footer: {
    zIndex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  footerBtn: { flex: 1 },
});
