import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  type TextInputProps,
} from 'react-native';
import { colors, fonts, radii, type } from '../theme';

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
        disabled && styles.keepsakeDisabled,
        pressed && !disabled && styles.keepsakePressed,
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
      style={({ pressed }) => [styles.quiet, pressed && styles.quietPressed]}
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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.ghostLink, pressed && { opacity: 0.7 }]}
    >
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
        placeholderTextColor={`${colors.muteSoft}99`}
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
        style={({ pressed }) => [styles.brandRow, pressed && { opacity: 0.85 }]}
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
        style={({ pressed }) => [styles.plusHit, pressed && styles.plusPressed]}
      >
        <Text style={styles.plus}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  keepsake: {
    minHeight: 56,
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  keepsakePressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },
  keepsakeDisabled: {
    opacity: 0.42,
  },
  fullWidth: { width: '100%' },
  trailing: { marginLeft: 'auto' },
  keepsakeLabel: {
    ...type.ui,
    color: colors.cream,
    letterSpacing: 0.15,
  },
  quiet: {
    minHeight: 50,
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.control,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  quietPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: colors.cream,
  },
  quietLabel: {
    ...type.ui,
    color: colors.ink,
  },
  ghostLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  ghostLinkLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.mute,
    textDecorationLine: 'underline',
    textDecorationColor: colors.butterDeep,
  },
  field: { gap: 8 },
  fieldLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.softLine,
    backgroundColor: colors.paper,
    borderRadius: radii.hair,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: colors.ink,
  },
  textarea: {
    minHeight: 150,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  header: {
    height: 78,
    paddingHorizontal: 26,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: radii.mark,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.butter,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
  },
  brandName: {
    ...type.brand,
    color: colors.ink,
  },
  brandSub: {
    marginTop: 3,
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
    letterSpacing: 0.3,
  },
  plusHit: {
    width: 40,
    height: 40,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusPressed: {
    transform: [{ scale: 0.96 }],
    backgroundColor: colors.butter,
  },
  plus: {
    fontFamily: fonts.sans,
    fontSize: 24,
    color: colors.ink,
    lineHeight: 26,
    marginTop: -1,
  },
});
