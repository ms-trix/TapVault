import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useFonts, DMSans_400Regular, DMSans_600SemiBold } from "@expo-google-fonts/dm-sans";
import { InstrumentSerif_400Regular } from "@expo-google-fonts/instrument-serif";
import * as SplashScreen from "expo-splash-screen";
import { NfcMark } from "./src/components/NfcMark";
import { SoftAmbient } from "./src/components/SoftAmbient";
import { AppHeader } from "./src/components/ui";
import { EntranceScreen } from "./src/screens/EntranceScreen";
import { ScanScreen } from "./src/screens/ScanScreen";
import { SealScreen } from "./src/screens/SealScreen";
import { LockedScreen } from "./src/screens/LockedScreen";
import { RevealScreen } from "./src/screens/RevealScreen";
import { features } from "./src/lib/features";
import { deleteMediaFile, persistMediaFile } from "./src/lib/media";
import { NATIVE_DRIVER, useReduceMotion } from "./src/lib/motion";
import {
  DEMO_TAG_ID,
  ensurePreseed,
  loadVault,
  resetDemoVault,
  saveVault,
} from "./src/lib/storage";
import { playClick, playUnlock } from "./src/lib/sfx";
import { isUnlocked, resolveUnlockAt } from "./src/lib/unlock";
import { stopVoicePlayback } from "./src/lib/voice";
import { colors, fonts, space, timing } from "./src/theme";
import { demoNote, type Note, type ScanPhase, type Screen, type UnlockDraft } from "./src/types";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function stepLabel(screen: Screen, scanPhase: ScanPhase) {
  if (screen === "entrance") return "Home";
  if (screen === "scan") {
    if (scanPhase === "found") return "Tag found";
    if (scanPhase === "detecting") return "Reading tag";
    return "Waiting for a tag";
  }
  if (screen === "scanSeal") {
    if (scanPhase === "found") return "Sealed";
    if (scanPhase === "detecting") return "Sealing onto tag";
    return "Seal onto tag";
  }
  if (screen === "seal") return "Write a note";
  if (screen === "locked") return "Sealed note";
  return "Opened note";
}

export default function App() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_600SemiBold,
    InstrumentSerif_400Regular,
  });
  const reduceMotion = useReduceMotion();

  const [screen, setScreen] = useState<Screen>("entrance");
  const [note, setNote] = useState<Note>(demoNote);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [from, setFrom] = useState("");
  const [voiceUri, setVoiceUri] = useState<string | undefined>();
  const [voiceDurationSec, setVoiceDurationSec] = useState<number | undefined>();
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [unlockDraft, setUnlockDraft] = useState<UnlockDraft>({ kind: "none" });
  const [scanPhase, setScanPhase] = useState<ScanPhase>("listening");
  const [opening, setOpening] = useState(false);
  const [sealError, setSealError] = useState<string | null>(null);
  const [continuityAssemble, setContinuityAssemble] = useState<boolean>(features.splashContinuity);
  const chromeReveal = useRef(new Animated.Value(features.splashContinuity ? 0 : 1)).current;
  const splashHidden = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sealingRef = useRef(false);

  useEffect(() => {
    if (!fontsLoaded) return;
    if (features.splashContinuity) return;
    SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  useEffect(() => {
    ensurePreseed()
      .then((seeded) => setNote(seeded))
      .catch(() => setNote(demoNote));
  }, []);

  useEffect(
    () => () => {
      timers.current?.forEach(clearTimeout);
    },
    [],
  );

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const hideNativeSplash = useCallback(() => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const handleMarkReady = useCallback(() => {
    hideNativeSplash();
    if (!features.splashContinuity) return;
    if (reduceMotion) {
      chromeReveal.setValue(1);
      return;
    }
    Animated.timing(chromeReveal, {
      toValue: 1,
      duration: timing.enterMs,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
  }, [chromeReveal, hideNativeSplash, reduceMotion]);

  const handleAssembleDone = useCallback(() => {
    setContinuityAssemble(false);
  }, []);

  const moveTo = useCallback((next: Screen) => {
    clearTimers();
    if (next === "scan" || next === "scanSeal") setScanPhase("listening");
    setOpening(false);
    setSealError(null);
    sealingRef.current = false;
    void stopVoicePlayback();
    setScreen(next);
  }, []);

  const clearDraft = () => {
    setRecipient("");
    setMessage("");
    setFrom("");
    setVoiceUri(undefined);
    setVoiceDurationSec(undefined);
    setPhotoUri(undefined);
    setUnlockDraft({ kind: "none" });
  };

  const useDemoTag = () => {
    if (scanPhase !== "listening") return;
    setScanPhase("detecting");
    void playClick();
    void (async () => {
      const stored = await loadVault(DEMO_TAG_ID);
      setNote(stored ?? demoNote);
    })();
    timers.current.push(
      setTimeout(() => {
        setScanPhase("found");
        void playClick();
      }, timing.detectMs),
      setTimeout(() => moveTo("locked"), timing.detectMs + timing.foundHoldMs),
    );
  };

  const sealOnTag = () => {
    if (scanPhase !== "listening" || sealingRef.current) return;
    const draft: Note = {
      recipient: recipient.trim(),
      message: message.trim(),
      from: from.trim(),
      voiceUri,
      voiceDurationSec,
      photoUri,
      unlockAt: resolveUnlockAt(unlockDraft),
    };
    if (!draft.recipient || !draft.message || !draft.from) return;

    sealingRef.current = true;
    setSealError(null);
    setScanPhase("detecting");
    void playClick();

    void (async () => {
      try {
        const previous = await loadVault(DEMO_TAG_ID);
        const nextPhoto = await persistMediaFile(draft.photoUri, "photo");
        const nextVoice = await persistMediaFile(draft.voiceUri, "voice");
        const next: Note = {
          ...draft,
          photoUri: nextPhoto,
          voiceUri: nextVoice,
        };
        await saveVault(DEMO_TAG_ID, next);
        if (previous?.photoUri && previous.photoUri !== next.photoUri) {
          void deleteMediaFile(previous.photoUri);
        }
        if (previous?.voiceUri && previous.voiceUri !== next.voiceUri) {
          void deleteMediaFile(previous.voiceUri);
        }
        setNote(next);
        clearDraft();
        timers.current.push(
          setTimeout(() => {
            setScanPhase("found");
            void playClick();
          }, timing.detectMs),
          setTimeout(() => moveTo("locked"), timing.detectMs + timing.foundHoldMs),
        );
      } catch {
        sealingRef.current = false;
        setScanPhase("listening");
        setSealError("Couldn’t seal the note. Try again.");
      }
    })();
  };

  const openNote = () => {
    if (opening) return;
    if (!isUnlocked(note.unlockAt)) return;
    setOpening(true);
    void playUnlock();
    timers.current.push(setTimeout(() => moveTo("reveal"), timing.unlockMs));
  };

  const handleResetDemo = () => {
    Alert.alert("Reset demo note?", "Restores the sample sealed note on this device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          void resetDemoVault()
            .then((restored) => {
              setNote(restored);
              void playClick();
            })
            .catch(() => undefined);
        },
      },
    ]);
  };

  useEffect(() => {
    const onHardwareBack = () => {
      if (screen === "entrance") return false;
      if (screen === "scan") {
        moveTo("entrance");
        return true;
      }
      if (screen === "seal") {
        moveTo("entrance");
        return true;
      }
      if (screen === "scanSeal") {
        if (scanPhase === "detecting" || sealingRef.current) return true;
        moveTo("seal");
        return true;
      }
      if (screen === "locked" || screen === "reveal") {
        moveTo("entrance");
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onHardwareBack);
    return () => sub.remove();
  }, [moveTo, scanPhase, screen]);

  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

  const stepLive = (screen === "scan" || screen === "scanSeal") && scanPhase === "listening";

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <SoftAmbient />
      <View style={styles.shell}>
        <Animated.View style={{ opacity: chromeReveal }}>
          <AppHeader
            mark={<NfcMark size={22} />}
            onHome={() => moveTo("entrance")}
            onMarkLongPress={handleResetDemo}
          />
        </Animated.View>
        <View style={styles.experience}>
          <Animated.View style={[styles.stepRow, { opacity: chromeReveal }]}>
            <View style={[styles.stepDot, stepLive && styles.stepDotLive]} />
            <Text style={styles.step}>{stepLabel(screen, scanPhase)}</Text>
          </Animated.View>
          {screen === "entrance" && (
            <EntranceScreen
              reduceMotion={reduceMotion}
              continuityAssemble={continuityAssemble}
              onMarkReady={handleMarkReady}
              onAssembleDone={handleAssembleDone}
              onScan={() => {
                void playClick();
                moveTo("scan");
              }}
              onLeaveNote={() => {
                void playClick();
                moveTo("seal");
              }}
              onResetDemo={() => {
                void resetDemoVault()
                  .then((restored) => {
                    setNote(restored);
                    void playClick();
                  })
                  .catch(() => undefined);
              }}
            />
          )}
          {screen === "scan" && (
            <ScanScreen
              mode="read"
              phase={scanPhase}
              onDemoTag={useDemoTag}
              onBack={() => moveTo("entrance")}
              continuityAssemble={false}
              reduceMotion={reduceMotion}
            />
          )}
          {screen === "scanSeal" && (
            <ScanScreen
              mode="write"
              phase={scanPhase}
              onDemoTag={sealOnTag}
              onBack={
                scanPhase === "detecting" || sealingRef.current ? undefined : () => moveTo("seal")
              }
              backDisabled={scanPhase === "detecting"}
              error={sealError}
              continuityAssemble={false}
              reduceMotion={reduceMotion}
            />
          )}
          {screen === "seal" && (
            <SealScreen
              recipient={recipient}
              message={message}
              from={from}
              voiceUri={voiceUri}
              voiceDurationSec={voiceDurationSec}
              photoUri={photoUri}
              unlockDraft={unlockDraft}
              onChangeRecipient={setRecipient}
              onChangeMessage={setMessage}
              onChangeFrom={setFrom}
              onChangeVoice={(uri, sec) => {
                setVoiceUri(uri);
                setVoiceDurationSec(sec);
              }}
              onChangePhoto={setPhotoUri}
              onChangeUnlock={setUnlockDraft}
              onBack={() => moveTo("entrance")}
              onContinue={() => {
                void playClick();
                moveTo("scanSeal");
              }}
            />
          )}
          {screen === "locked" && (
            <LockedScreen
              note={note}
              opening={opening}
              onOpen={openNote}
              onBack={() => moveTo("entrance")}
            />
          )}
          {screen === "reveal" && (
            <RevealScreen
              note={note}
              onStartAgain={() => moveTo("entrance")}
              onNewNote={() => moveTo("seal")}
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
    flexDirection: "row",
    alignItems: "center",
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
