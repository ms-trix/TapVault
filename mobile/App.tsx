import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, DMSans_400Regular, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';
import { NfcMark } from './src/components/NfcMark';
import { AppHeader } from './src/components/ui';
import { ScanScreen } from './src/screens/ScanScreen';
import { SealScreen } from './src/screens/SealScreen';
import { LockedScreen } from './src/screens/LockedScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { DEMO_TAG_ID, ensurePreseed, saveVault } from './src/lib/storage';
import { playClick, playUnlock } from './src/lib/sfx';
import { colors, timing } from './src/theme';
import { demoNote, type Note, type ScanPhase, type Screen } from './src/types';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function stepLabel(screen: Screen, scanPhase: ScanPhase) {
  if (screen === 'scan') {
    if (scanPhase === 'found') return 'Demo tag found';
    if (scanPhase === 'detecting') return 'Reading demo tag';
    return 'Demo scan';
  }
  if (screen === 'seal') return 'A new note';
  if (screen === 'locked') return 'A sealed note';
  return 'A moment to keep';
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
  });

  const [screen, setScreen] = useState<Screen>('scan');
  const [note, setNote] = useState<Note>(demoNote);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [from, setFrom] = useState('');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('listening');
  const [opening, setOpening] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  useEffect(() => {
    ensurePreseed()
      .then((seeded) => setNote(seeded))
      .catch(() => setNote(demoNote));
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const moveTo = useCallback((next: Screen) => {
    clearTimers();
    if (next === 'scan') setScanPhase('listening');
    setOpening(false);
    setScreen(next);
  }, []);

  const useDemoTag = () => {
    if (scanPhase !== 'listening') return;
    setScanPhase('detecting');
    setNote(demoNote);
    void saveVault(DEMO_TAG_ID, demoNote);
    void playClick();
    timers.current.push(
      setTimeout(() => {
        setScanPhase('found');
        void playClick();
      }, timing.detectMs),
      setTimeout(() => moveTo('locked'), timing.detectMs + timing.foundHoldMs),
    );
  };

  const sealNote = () => {
    const next: Note = {
      recipient: recipient.trim(),
      message: message.trim(),
      from: from.trim(),
    };
    if (!next.recipient || !next.message || !next.from) return;
    setNote(next);
    void saveVault(DEMO_TAG_ID, next);
    void playClick();
    moveTo('locked');
  };

  const openNote = () => {
    if (opening) return;
    setOpening(true);
    void playUnlock();
    timers.current.push(setTimeout(() => moveTo('reveal'), timing.unlockMs));
  };

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <AppHeader
        mark={<NfcMark size={22} />}
        onHome={() => moveTo('scan')}
        onNewNote={() => moveTo('seal')}
      />
      <View style={styles.experience}>
        <Text style={styles.step}>{stepLabel(screen, scanPhase)}</Text>
        {screen === 'scan' && (
          <ScanScreen phase={scanPhase} onDemoTag={useDemoTag} onLeaveNote={() => moveTo('seal')} />
        )}
        {screen === 'seal' && (
          <SealScreen
            recipient={recipient}
            message={message}
            from={from}
            onChangeRecipient={setRecipient}
            onChangeMessage={setMessage}
            onChangeFrom={setFrom}
            onBack={() => moveTo('scan')}
            onSeal={sealNote}
          />
        )}
        {screen === 'locked' && (
          <LockedScreen
            note={note}
            opening={opening}
            onOpen={openNote}
            onBack={() => moveTo('scan')}
          />
        )}
        {screen === 'reveal' && (
          <RevealScreen
            note={note}
            onStartAgain={() => moveTo('scan')}
            onNewNote={() => moveTo('seal')}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  experience: {
    flex: 1,
    paddingHorizontal: 26,
    paddingBottom: 24,
  },
  step: {
    fontSize: 11,
    color: colors.muteSoft,
    marginBottom: 12,
  },
});
