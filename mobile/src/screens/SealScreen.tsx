import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { Field, GhostLink, KeepsakeButton } from '../components/ui';
import { colors } from '../theme';

type Props = {
  recipient: string;
  message: string;
  from: string;
  onChangeRecipient: (v: string) => void;
  onChangeMessage: (v: string) => void;
  onChangeFrom: (v: string) => void;
  onBack: () => void;
  onSeal: () => void;
};

export function SealScreen({
  recipient,
  message,
  from,
  onChangeRecipient,
  onChangeMessage,
  onChangeFrom,
  onBack,
  onSeal,
}: Props) {
  return (
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
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.hint}>Your note stays on this device for the demo.</Text>
        <KeepsakeButton
          label="Seal this note"
          onPress={onSeal}
          trailing={<ArrowRight size={16} color={colors.cream} />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  scroll: { paddingTop: 8, paddingBottom: 20, gap: 8 },
  heading: {
    fontFamily: 'Georgia',
    fontSize: 44,
    lineHeight: 46,
    color: colors.ink,
    marginTop: 18,
    marginBottom: 10,
  },
  support: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.muteSoft,
    marginBottom: 20,
  },
  fields: { gap: 20 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    gap: 12,
  },
  hint: { fontSize: 11, lineHeight: 16, color: colors.muteSoft },
});
