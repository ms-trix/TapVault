import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { NfcMark } from '../components/NfcMark';
import { FooterRail } from '../components/PaperSurface';
import { GhostLink, KeepsakeButton } from '../components/ui';
import { NATIVE_DRIVER } from '../lib/motion';
import { colors, fonts, radii, space, type } from '../theme';
import type { Note } from '../types';

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

  return (
    <View style={styles.body}>
      <Animated.View
        style={[
          styles.main,
          { opacity, transform: [{ translateY: rise }] },
        ]}
      >
        <View style={styles.column}>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              For {note.recipient} · From {note.from}
            </Text>
          </View>
          <Animated.View
            style={[
              styles.emblem,
              { transform: [{ rotate: '-4deg' }, { scale: emblemScale }] },
            ]}
          >
            <View style={styles.emblemInner}>
              <NfcMark size={52} />
            </View>
          </Animated.View>
          <Text style={styles.title}>Still sealed.</Text>
          <Text style={styles.teaser}>
            A few words are waiting here, just for {note.recipient}.
          </Text>
        </View>
      </Animated.View>
      <Animated.View style={{ opacity }}>
        <FooterRail style={styles.footer}>
          <View style={styles.readyRow}>
            <Text style={styles.readyStrong}>Ready to open</Text>
            <Text style={styles.readyMute}>
              {note.voiceUri ? 'Note + voice' : `For ${note.recipient}`}
            </Text>
          </View>
          <KeepsakeButton
            label={opening ? 'Opening…' : 'Open the note'}
            onPress={onOpen}
            disabled={opening}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: 8,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.softLine,
    borderRadius: radii.hair,
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
  },
  emblem: {
    width: 120,
    height: 120,
    marginVertical: 40,
    borderRadius: radii.tag,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemInner: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${colors.ink}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.displayHero,
    color: colors.ink,
    marginBottom: 12,
  },
  teaser: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    color: colors.muteSoft,
    textAlign: 'center',
    maxWidth: 280,
    paddingBottom: space.sm,
  },
  footer: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  readyRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  readyStrong: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    color: colors.ink,
  },
  readyMute: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
  },
});
