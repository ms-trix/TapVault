import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { colors, fonts, radii } from "../theme";
import type { UnlockDraft } from "../types";
import { formatUnlockLabel } from "../lib/unlock";

type Props = {
  value: UnlockDraft;
  disabled?: boolean;
  onChange: (next: UnlockDraft) => void;
};

const PRESETS: { kind: "30m" | "2h" | "tomorrow"; label: string }[] = [
  { kind: "30m", label: "30 min" },
  { kind: "2h", label: "2 hours" },
  { kind: "tomorrow", label: "Tomorrow" },
];

export function UnlockAtRow({ value, disabled, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [androidStep, setAndroidStep] = useState<"date" | "time" | null>(null);
  const [draftDate, setDraftDate] = useState(() => minDate());

  const selectedKind = value.kind;

  const selectPreset = (kind: "30m" | "2h" | "tomorrow") => {
    if (disabled) return;
    onChange(value.kind === kind ? { kind: "none" } : { kind });
  };

  const openCustom = () => {
    if (disabled) return;
    const start = value.kind === "custom" ? value.at : minDate();
    setDraftDate(start);
    if (Platform.OS === "android") {
      setAndroidStep("date");
    } else if (Platform.OS === "ios") {
      setShowPicker(true);
      onChange({ kind: "custom", at: start });
    } else {
      // Web: snap to +1 hour as a simple custom fallback
      const at = new Date(Date.now() + 60 * 60 * 1000);
      onChange({ kind: "custom", at });
    }
  };

  const handleIosChange = (_: DateTimePickerEvent, date?: Date) => {
    if (!date) return;
    const clamped = date < minDate() ? minDate() : date;
    setDraftDate(clamped);
    onChange({ kind: "custom", at: clamped });
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "dismissed") {
      setAndroidStep(null);
      return;
    }
    if (!date) {
      setAndroidStep(null);
      return;
    }
    if (androidStep === "date") {
      const next = new Date(draftDate);
      next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setDraftDate(next);
      setAndroidStep("time");
      return;
    }
    const next = new Date(draftDate);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    const clamped = next < minDate() ? minDate() : next;
    setDraftDate(clamped);
    onChange({ kind: "custom", at: clamped });
    setAndroidStep(null);
  };

  return (
    <View style={styles.block}>
      <Text style={styles.label}>Open after</Text>
      <Text style={styles.hint}>Optional · hard lock until that time</Text>
      <View style={styles.chips}>
        {PRESETS.map((p) => {
          const on = selectedKind === p.kind;
          return (
            <Pressable
              key={p.kind}
              disabled={disabled}
              onPress={() => selectPreset(p.kind)}
              style={({ pressed }) => [
                styles.chip,
                on && styles.chipOn,
                pressed && styles.chipPressed,
                disabled && styles.disabled,
              ]}
            >
              <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{p.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          disabled={disabled}
          onPress={openCustom}
          style={({ pressed }) => [
            styles.chip,
            selectedKind === "custom" && styles.chipOn,
            pressed && styles.chipPressed,
            disabled && styles.disabled,
          ]}
        >
          <Text style={[styles.chipLabel, selectedKind === "custom" && styles.chipLabelOn]}>
            Custom…
          </Text>
        </Pressable>
      </View>
      {value.kind === "custom" ? (
        <Text style={styles.customMeta}>Opens {formatUnlockLabel(value.at.toISOString())}</Text>
      ) : null}
      {value.kind === "tomorrow" ? <Text style={styles.customMeta}>Tomorrow at 9:00</Text> : null}
      {value.kind !== "none" ? (
        <Pressable onPress={() => onChange({ kind: "none" })} hitSlop={8} disabled={disabled}>
          <Text style={styles.clear}>Clear unlock time</Text>
        </Pressable>
      ) : null}

      {showPicker && Platform.OS === "ios" ? (
        <View style={styles.iosPicker}>
          <DateTimePicker
            value={draftDate}
            mode="datetime"
            minimumDate={minDate()}
            onChange={handleIosChange}
            display="spinner"
            themeVariant="light"
          />
          <Pressable onPress={() => setShowPicker(false)} style={styles.done}>
            <Text style={styles.doneLabel}>Done</Text>
          </Pressable>
        </View>
      ) : null}

      {androidStep === "date" ? (
        <DateTimePicker
          value={draftDate}
          mode="date"
          minimumDate={minDate()}
          onChange={handleAndroidChange}
        />
      ) : null}
      {androidStep === "time" ? (
        <DateTimePicker value={draftDate} mode="time" onChange={handleAndroidChange} />
      ) : null}
    </View>
  );
}

function minDate() {
  return new Date(Date.now() + 60 * 1000);
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  label: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.ink },
  hint: { fontFamily: fonts.sans, fontSize: 11, color: colors.muteSoft, marginTop: -4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.paper,
    borderRadius: radii.control,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipPressed: { transform: [{ scale: 0.98 }] },
  chipLabel: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.ink },
  chipLabelOn: { color: colors.cream },
  customMeta: { fontFamily: fonts.sans, fontSize: 11, color: colors.muteSoft },
  clear: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.mute,
    textDecorationLine: "underline",
    textDecorationColor: colors.butterDeep,
  },
  iosPicker: { marginTop: 4 },
  done: { alignSelf: "flex-end", paddingVertical: 8, paddingHorizontal: 4 },
  doneLabel: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  disabled: { opacity: 0.42 },
});
