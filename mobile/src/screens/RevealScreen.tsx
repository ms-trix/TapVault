import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ArrowLeft, Plus, Square } from 'lucide-react-native';
import { FooterRail } from '../components/PaperSurface';
import { KeepsakeButton, QuietButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { formatDuration, playVoice, stopVoicePlayback } from '../lib/voice';
import { colors, fonts, space, surface, type } from '../theme';
import type { Note } from '../types';

type Props = {
  note: Note;
  onStartAgain: () => void;
  onNewNote: () => void;
};

export function RevealScreen({ note, onStartAgain, onNewNote }: Props) {
  const letterAnim = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(false);
  const { width, height } = useWindowDimensions();
  /** Readable measure inside the full-bleed sheet */
  const measure = Math.min(420, Math.max(260, width - 88));
  const sheetMin = Math.min(420, Math.max(280, height * 0.42));

  useEffect(() => {
    letterAnim.setValue(0);
    Animated.timing(letterAnim, {
      toValue: 1,
      duration: 440,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [letterAnim, note.recipient, note.message]);

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
      <ScrollView
        contentContainerStyle={styles.main}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              minHeight: sheetMin,
              opacity: letterAnim,
              transform: [
                {
                  translateY: letterAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sheetTop} />
          <View style={[styles.measure, { maxWidth: measure }]}>
            <Text style={styles.from}>From {note.from}</Text>
            <Text style={styles.greeting}>For {note.recipient}.</Text>
            <Text style={styles.message}>{note.message}</Text>

            <View style={styles.spacer} />

            <View style={styles.closing}>
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
    paddingBottom: space.sm,
  },
  sheet: {
    flexGrow: 1,
    marginHorizontal: -26,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 26,
    paddingTop: 22,
    paddingBottom: 26,
  },
  sheetTop: {
    height: 3,
    marginHorizontal: -26,
    marginTop: -22,
    marginBottom: 20,
    backgroundColor: surface.edge,
    opacity: 0.9,
  },
  measure: {
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
  },
  from: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muteSoft,
    marginBottom: 8,
  },
  greeting: {
    ...type.displayTitle,
    color: colors.ink,
    marginBottom: 18,
  },
  message: {
    fontFamily: fonts.sans,
    fontSize: 17,
    lineHeight: 28,
    color: colors.ink,
  },
  spacer: {
    flexGrow: 1,
    minHeight: 36,
  },
  closing: {
    marginTop: 8,
  },
  signature: {
    ...type.displaySign,
    color: colors.ink,
  },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
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
  playPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.92,
  },
  playTriangle: {
    color: colors.cream,
    fontSize: 13,
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
