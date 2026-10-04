import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Plus, Square } from 'lucide-react-native';
import { FooterRail } from '../components/PaperSurface';
import { KeepsakeButton, QuietButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { formatDuration, playVoice, stopVoicePlayback } from '../lib/voice';
import { colors, fonts, radii, space, type } from '../theme';
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
      duration: 480,
      easing: Easing.out(Easing.cubic),
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
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.message}>{note.message}</Text>
          <View style={styles.letterFoot}>
            <Text style={styles.signature}>{note.from}</Text>
            {note.voiceUri ? (
              <View style={styles.voice}>
                <Pressable
                  onPress={() => void toggleVoice()}
                  style={({ pressed }) => [styles.play, pressed && styles.playPressed]}
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
                  <Text style={styles.voiceMeta}>
                    {formatDuration(note.voiceDurationSec ?? 0)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>
        <Text style={styles.caption}>Opened by holding this gift</Text>
      </ScrollView>
      <FooterRail style={styles.footer}>
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
      </FooterRail>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  scroll: { flex: 1 },
  main: {
    flexGrow: 1,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  kicker: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muteSoft,
  },
  heading: {
    ...type.displayHero,
    color: colors.ink,
    marginTop: space.sm,
    marginBottom: space.md,
  },
  letter: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: colors.softLine,
    backgroundColor: colors.paper,
    paddingHorizontal: 26,
    paddingVertical: 28,
    minHeight: 340,
    borderRadius: radii.hair,
    justifyContent: 'space-between',
  },
  message: {
    ...type.bodyLarge,
    color: colors.ink,
  },
  letterFoot: {
    marginTop: 36,
  },
  signature: {
    ...type.displaySign,
    color: colors.ink,
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.softLine,
  },
  play: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  playTriangle: {
    color: colors.cream,
    fontSize: 14,
    marginLeft: 2,
    fontFamily: fonts.sans,
  },
  voiceTitle: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
  },
  voiceMeta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
    marginTop: 2,
  },
  caption: {
    textAlign: 'center',
    fontFamily: fonts.sans,
    color: colors.muteSoft,
    fontSize: 11,
    marginTop: space.md,
  },
  footer: {
    marginHorizontal: -26,
    paddingHorizontal: 26,
    flexDirection: 'row',
    gap: 10,
  },
  footerBtn: { flex: 1 },
});
