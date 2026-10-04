import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { FooterRail } from '../components/PaperSurface';
import { ScreenEnter } from '../components/ScreenEnter';
import { VoiceRow } from '../components/VoiceRow';
import { Field, GhostLink, KeepsakeButton } from '../components/ui';
import {
  MAX_VOICE_SEC,
  cancelVoiceRecording,
  startVoiceRecording,
  stopVoiceRecording,
} from '../lib/voice';
import { colors, fonts, space, type } from '../theme';

type Props = {
  recipient: string;
  message: string;
  from: string;
  voiceUri?: string;
  voiceDurationSec?: number;
  onChangeRecipient: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onChangeFrom: (v: string) => void;
  onChangeVoice: (uri?: string, durationSec?: number) => void;
  onBack: () => void;
  onSeal: () => void;
};

export function SealScreen({
  recipient,
  message,
  from,
  voiceUri,
  voiceDurationSec,
  onChangeRecipient,
  onChangeMessage,
  onChangeFrom,
  onChangeVoice,
  onBack,
  onSeal,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const canSeal = Boolean(recipient.trim() && message.trim() && from.trim());

  useEffect(
    () => () => {
      if (tick.current) clearInterval(tick.current);
      void cancelVoiceRecording();
    },
    [],
  );

  const clearTick = () => {
    if (tick.current) {
      clearInterval(tick.current);
      tick.current = null;
    }
  };

  const toggleRecord = async () => {
    setError(null);
    if (recording) {
      clearTick();
      try {
        const result = await stopVoiceRecording();
        onChangeVoice(result.uri, result.durationSec);
      } catch {
        setError('Couldn’t save the recording. Try again.');
      }
      setRecording(false);
      setRecordSec(0);
      return;
    }

    try {
      await startVoiceRecording();
      setRecording(true);
      setRecordSec(0);
      const started = Date.now();
      tick.current = setInterval(() => {
        const elapsed = (Date.now() - started) / 1000;
        setRecordSec(elapsed);
        if (elapsed >= MAX_VOICE_SEC) {
          void (async () => {
            clearTick();
            try {
              const result = await stopVoiceRecording();
              onChangeVoice(result.uri, result.durationSec);
            } catch {
              setError('Recording stopped at the 30s limit.');
            }
            setRecording(false);
            setRecordSec(0);
          })();
        }
      }, 200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t reach the microphone.');
      setRecording(false);
    }
  };

  return (
    <ScreenEnter>
      <View style={styles.body}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <GhostLink
            label="Back"
            onPress={onBack}
            leading={<ArrowLeft size={15} color={colors.mute} />}
          />
          <Text style={styles.heading}>Leave a note</Text>
          <Text style={styles.support}>A few words they can keep close.</Text>
          <View style={styles.fields}>
            <Field
              label="For"
              value={recipient}
              onChangeText={onChangeRecipient}
              placeholder="Someone special"
              maxLength={60}
            />
            <Field
              label="Message"
              value={message}
              onChangeText={onChangeMessage}
              placeholder="Write what you want them to remember…"
              maxLength={1000}
              multiline
            />
            <Field
              label="From"
              value={from}
              onChangeText={onChangeFrom}
              placeholder="Your name"
              maxLength={60}
            />
            <VoiceRow
              recording={recording}
              recordSec={recordSec}
              voiceUri={voiceUri}
              voiceDurationSec={voiceDurationSec}
              error={error}
              onToggle={() => void toggleRecord()}
              onClear={() => onChangeVoice(undefined, undefined)}
            />
          </View>
        </ScrollView>
        <FooterRail style={styles.footer}>
          <Text style={styles.hint}>Your note stays on this device for the demo.</Text>
          <KeepsakeButton
            label="Seal this note"
            onPress={onSeal}
            disabled={!canSeal || recording}
            trailing={<ArrowRight size={16} color={colors.cream} />}
          />
        </FooterRail>
      </View>
    </ScreenEnter>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  scroll: { paddingTop: 2, paddingBottom: space.md, flexGrow: 1 },
  heading: {
    ...type.displayHero,
    color: colors.ink,
    marginTop: space.sm,
    marginBottom: space.xs,
  },
  support: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 21,
    color: colors.muteSoft,
    marginBottom: space.md,
  },
  fields: { gap: space.lg },
  footer: {
    marginHorizontal: -26,
    paddingHorizontal: 26,
  },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 16,
    color: colors.muteSoft,
  },
});
