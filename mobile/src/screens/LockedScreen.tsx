import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { NfcMark } from '../components/NfcMark';
import { GhostLink, KeepsakeButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { colors } from '../theme';
import type { Note } from '../types';

type Props = {
  note: Note;
  opening: boolean;
  onOpen: () => void;
  onBack: () => void;
};

export function LockedScreen({ note, opening, onOpen, onBack }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 8,
        tension: 70,
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]).start();
  }, [emblemScale, opacity]);

  useEffect(() => {
    if (!opening) return;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: NATIVE_DRIVER,
      }),
      Animated.timing(emblemScale, {
        toValue: 1.08,
        duration: 380,
        useNativeDriver: NATIVE_DRIVER,
      }),
    ]).start();
  }, [emblemScale, opening, opacity]);

  return (
    <View style={styles.body}>
      <Animated.View style={[styles.main, { opacity }]}>
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            For {note.recipient} · From {note.from}
          </Text>
        </View>
        <Animated.View
          style={[
            styles.emblem,
            { transform: [{ rotate: '-5deg' }, { scale: emblemScale }] },
          ]}
        >
          <NfcMark size={54} />
        </Animated.View>
        <Text style={styles.title}>Still sealed.</Text>
        <Text style={styles.teaser}>A few words are waiting here, just for {note.recipient}.</Text>
      </Animated.View>
      <Animated.View style={[styles.footer, { opacity }]}>
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
