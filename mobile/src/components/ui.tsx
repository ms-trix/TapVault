import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  type TextInputProps,
} from 'react-native';
import { colors } from '../theme';

export function KeepsakeButton({
  label,
  onPress,
  disabled,
  trailing,
  leading,
  fullWidth = true,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  trailing?: ReactNode;
  leading?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.keepsake,
        fullWidth && styles.fullWidth,
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.88 },
      ]}
    >
      {leading}
      <Text style={styles.keepsakeLabel}>{label}</Text>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  );
}

export function QuietButton({
  label,
  onPress,
  leading,
}: {
  label: string;
  onPress?: () => void;
  leading?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.quiet, pressed && { opacity: 0.85 }]}
    >
      {leading}
      <Text style={styles.quietLabel}>{label}</Text>
    </Pressable>
  );
}

export function GhostLink({
  label,
  onPress,
  leading,
}: {
  label: string;
  onPress?: () => void;
  leading?: ReactNode;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.ghostLink}>
      {leading}
      <Text style={styles.ghostLinkLabel}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={`${colors.muteSoft}B3`}
        style={[styles.input, props.multiline && styles.textarea]}
        {...props}
      />
    </View>
  );
}

export function AppHeader({
  mark,
  onHome,
  onNewNote,
}: {
  mark: ReactNode;
  onHome: () => void;
  onNewNote: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onHome}
        style={styles.brandRow}
        accessibilityRole="button"
        accessibilityLabel="TapVault home"
      >
        <View style={styles.brandMark}>{mark}</View>
        <View>
          <Text style={styles.brandName}>TapVault</Text>
          <Text style={styles.brandSub}>touch to open</Text>
        </View>
      </Pressable>
      <Pressable
        onPress={onNewNote}
        accessibilityRole="button"
        accessibilityLabel="Leave a new note"
        style={styles.plusHit}
      >
        <Text style={styles.plus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  keepsake: {
    minHeight: 54,
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fullWidth: { width: '100%' },
  trailing: { marginLeft: 'auto' },
  keepsakeLabel: {
    color: colors.cream,
    fontSize: 13,
    fontWeight: '600',
  },
  quiet: {
    minHeight: 48,
    backgroundColor: colors.cream,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 3,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  quietLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  ghostLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  ghostLinkLabel: {
    color: colors.mute,
    fontSize: 12,
    fontWeight: '600',
  },
  field: { gap: 8 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.ink },
  input: {
    borderWidth: 1,
    borderColor: colors.softLine,
    backgroundColor: colors.paper,
    borderRadius: 2,
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.ink,
  },
  textarea: {
    minHeight: 145,
    textAlignVertical: 'top',
  },
  header: {
    height: 74,
    paddingHorizontal: 26,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-6deg' }],
  },
  brandName: {
    fontFamily: 'Georgia',
    fontSize: 26,
    color: colors.ink,
    lineHeight: 28,
  },
  brandSub: {
    marginTop: 4,
    fontSize: 10,
    color: colors.muteSoft,
    letterSpacing: 1,
  },
  plusHit: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 28,
    color: colors.ink,
    lineHeight: 30,
    marginTop: -2,
  },
});
