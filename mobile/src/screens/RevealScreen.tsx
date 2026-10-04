import { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { SoftAmbient } from '../components/SoftAmbient';
import { KeepsakeButton, QuietButton } from '../components/ui';
import { colors } from '../theme';
import type { Note } from '../types';

type Props = {
  note: Note;
  onStartAgain: () => void;
  onNewNote: () => void;
};

export function RevealScreen({ note, onStartAgain, onNewNote }: Props) {
  const letter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(letter, {
      toValue: 1,
      duration: 850,
      useNativeDriver: true,
    }).start();
  }, [letter]);

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
                  translateY: letter.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.message}>{note.message}</Text>
          <Text style={styles.signature}>{note.from}</Text>
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
