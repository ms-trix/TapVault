import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { ArrowLeft, Plus } from "lucide-react-native";
import { KeepsakeButton, QuietButton } from "../components/ui";
import { VoicePlayRow } from "../components/VoicePlayRow";
import { resolveMediaUri } from "../lib/media";
import { NATIVE_DRIVER } from "../lib/motion";
import { playVoice, stopVoicePlayback } from "../lib/voice";
import { colors, fonts, radii, space, type } from "../theme";
import type { Note } from "../types";

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

  const photoUri = resolveMediaUri(note.photoUri);
  const voiceUri = resolveMediaUri(note.voiceUri);

  const toggleVoice = async () => {
    if (!voiceUri) return;
    if (playing) {
      await stopVoicePlayback();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    try {
      await playVoice(voiceUri, () => setPlaying(false));
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
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} resizeMode="cover" />
          ) : null}
          <Text style={styles.message}>{note.message}</Text>
          <Text style={styles.signature}>{note.from}</Text>
          {voiceUri ? (
            <VoicePlayRow
              durationSec={note.voiceDurationSec}
              playing={playing}
              onToggle={() => void toggleVoice()}
            />
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
  body: { flex: 1 },
  scroll: { zIndex: 1 },
  main: { paddingTop: space.md, paddingBottom: space.md },
  kicker: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muteSoft,
  },
  heading: {
    ...type.displayHero,
    color: colors.ink,
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  letter: {
    borderWidth: 1,
    borderColor: colors.softLine,
    backgroundColor: colors.paper,
    paddingHorizontal: 28,
    paddingVertical: 32,
    minHeight: 280,
    borderRadius: radii.hair,
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: radii.hair,
    marginBottom: 20,
    backgroundColor: colors.border,
  },
  message: {
    ...type.bodyLarge,
    color: colors.ink,
  },
  signature: {
    ...type.displaySign,
    color: colors.ink,
    marginTop: 40,
  },
  caption: {
    textAlign: "center",
    fontFamily: fonts.sans,
    color: colors.muteSoft,
    fontSize: 11,
    marginTop: space.md,
  },
  footer: {
    zIndex: 1,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.md,
    flexDirection: "row",
    gap: 10,
  },
  footerBtn: { flex: 1 },
});
