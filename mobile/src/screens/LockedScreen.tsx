import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { NfcMark } from '../components/NfcMark';
import { GhostLink, KeepsakeButton } from '../components/ui';
import { colors } from '../theme';
import type { Note } from '../types';

type Props = {
  note: Note;
  opening: boolean;
  onOpen: () => void;
  onBack: () => void;
};

export function LockedScreen({ note, opening, onOpen, onBack }: Props) {
  const enter = useRef(new Animated.Value(0)).current;
  const leave = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [enter]);

  useEffect(() => {
    if (!opening) return;
    Animated.timing(leave, {
      toValue: 0,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [leave, opening]);

  const emblemStyle = {
    opacity: Animated.multiply(enter, leave),
    transform: [
      {
        scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.84, opening ? 1.12 : 1] }),
      },
      {
        rotate: enter.interpolate({
          inputRange: [0, 1],
          outputRange: ['-8deg', '-5deg'],
        }),
      },
    ],
  };

  const fadeCopy = {
    opacity: leave,
    transform: [
      {
        translateY: leave.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }),
      },
    ],
  };

  return (
    <View style={styles.body}>
      <View style={styles.main}>
        <Animated.View style={[styles.meta, fadeCopy]}>
          <Text style={styles.metaText}>
            For {note.recipient} · From {note.from}
          </Text>
        </Animated.View>
        <Animated.View style={[styles.emblem, emblemStyle]}>
          <NfcMark size={54} />
        </Animated.View>
        <Animated.Text style={[styles.title, fadeCopy]}>Still sealed.</Animated.Text>
        <Animated.Text style={[styles.teaser, fadeCopy]}>
          A few words are waiting here, just for {note.recipient}.
        </Animated.Text>
      </View>
      <Animated.View style={[styles.footer, fadeCopy]}>
        <View style={styles.readyRow}>
          <Text style={styles.readyStrong}>Ready to open</Text>
          <Text style={styles.readyMute}>For {note.recipient}</Text>
        </View>
        <KeepsakeButton
          label={opening ? 'Opening…' : 'Open the note'}
          onPress={onOpen}
          disabled={opening}
          trailing={<ArrowRight size={16} color={colors.cream} />}
        />
        <GhostLink label="Back to start" onPress={onBack} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  meta: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 100,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  metaText: { fontSize: 12, fontWeight: '600', color: colors.muteSoft },
  emblem: {
    width: 104,
    height: 104,
    marginVertical: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Georgia',
    fontSize: 44,
    lineHeight: 46,
    color: colors.ink,
    marginBottom: 14,
  },
  teaser: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.muteSoft,
    textAlign: 'center',
    maxWidth: 270,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    gap: 10,
    alignItems: 'center',
  },
  readyRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  readyStrong: { fontSize: 11, fontWeight: '600', color: colors.ink },
  readyMute: { fontSize: 11, color: colors.muteSoft },
});
