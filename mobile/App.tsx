import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, DMSans_400Regular, DMSans_600SemiBold } from '@expo-google-fonts/dm-sans';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import * as SplashScreen from 'expo-splash-screen';
import { NfcMark } from './src/components/NfcMark';
import { SoftAmbient } from './src/components/SoftAmbient';
import { AppHeader } from './src/components/ui';
import { ScanScreen } from './src/screens/ScanScreen';
import { SealScreen } from './src/screens/SealScreen';
import { LockedScreen } from './src/screens/LockedScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { DEMO_TAG_ID, ensurePreseed, loadVault, saveVault } from './src/lib/storage';
import { playClick, playUnlock } from './src/lib/sfx';
import { stopVoicePlayback } from './src/lib/voice';
import { colors, fonts, space, timing } from './src/theme';
import { demoNote, type Note, type ScanPhase, type Screen } from './src/types';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function stepLabel(screen: Screen, scanPhase: ScanPhase) {
  if (screen === 'scan') {
    if (scanPhase === 'found') return 'Tag found';
    if (scanPhase === 'detecting') return 'Reading tag';
    return 'Waiting for a tag';
  }
  if (screen === 'seal') return 'Write a note';
  if (screen === 'locked') return 'Sealed note';
  return 'Opened note';
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
    InstrumentSerif_400Regular,
  });

  const [screen, setScreen] = useState<Screen>('scan');
  const [note, setNote] = useState<Note>(demoNote);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [from, setFrom] = useState('');
  const [voiceUri, setVoiceUri] = useState<string | undefined>();
  const [voiceDurationSec, setVoiceDurationSec] = useState<number | undefined>();
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
    void stopVoicePlayback();
    setScreen(next);
  }, []);

  const useDemoTag = () => {
    if (scanPhase !== 'listening') return;
    setScanPhase('detecting');
    void playClick();
    void (async () => {
      const stored = await loadVault(DEMO_TAG_ID);
      setNote(stored ?? demoNote);
    })();
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
      voiceUri,
      voiceDurationSec,
    };
    if (!next.recipient || !next.message || !next.from) return;
    setNote(next);
    void saveVault(DEMO_TAG_ID, next);
    void playClick();
    setRecipient('');
    setMessage('');
    setFrom('');
    setVoiceUri(undefined);
    setVoiceDurationSec(undefined);
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

  const stepLive = screen === 'scan' && scanPhase === 'listening';

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <SoftAmbient />
      <View style={styles.shell}>
        <AppHeader
          mark={<NfcMark size={22} />}
          onHome={() => moveTo('scan')}
          onNewNote={() => moveTo('seal')}
        />
        <View style={styles.experience}>
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, stepLive && styles.stepDotLive]} />
            <Text style={styles.step}>{stepLabel(screen, scanPhase)}</Text>
          </View>
          {screen === 'scan' && (
            <ScanScreen
              phase={scanPhase}
              onDemoTag={useDemoTag}
              onLeaveNote={() => moveTo('seal')}
            />
          )}
          {screen === 'seal' && (
            <SealScreen
              recipient={recipient}
              message={message}
              from={from}
              voiceUri={voiceUri}
              voiceDurationSec={voiceDurationSec}
              onChangeRecipient={setRecipient}
              onChangeMessage={setMessage}
              onChangeFrom={setFrom}
              onChangeVoice={(uri, sec) => {
                setVoiceUri(uri);
                setVoiceDurationSec(sec);
              }}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  shell: {
    flex: 1,
    zIndex: 1,
  },
  experience: {
    flex: 1,
    paddingHorizontal: 26,
    paddingBottom: space.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: space.sm,
    minHeight: 18,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  stepDotLive: {
    backgroundColor: colors.butterDeep,
    shadowColor: colors.butterDeep,
    shadowOpacity: 0.55,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  step: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
    letterSpacing: 0.25,
  },
});
