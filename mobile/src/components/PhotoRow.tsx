import { useState } from "react";
import { Alert, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImagePlus } from "lucide-react-native";
import { colors, fonts, radii } from "../theme";
import { resolveMediaUri } from "../lib/media";

type Props = {
  photoUri?: string;
  disabled?: boolean;
  onChange: (uri?: string) => void;
};

export function PhotoRow({ photoUri, disabled, onChange }: Props) {
  const [error, setError] = useState<string | null>(null);
  const preview = resolveMediaUri(photoUri);

  const pick = async (source: "library" | "camera") => {
    if (disabled) return;
    setError(null);
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          setError("Camera permission is needed to take a photo.");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.7,
        });
        if (!result.canceled && result.assets[0]?.uri) onChange(result.assets[0].uri);
        return;
      }

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setError("Photo library permission is needed.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]?.uri) onChange(result.assets[0].uri);
    } catch {
      setError("Couldn’t add a photo. Try again.");
    }
  };

  const handleAdd = () => {
    if (disabled) return;
    if (Platform.OS === "web") {
      void pick("library");
      return;
    }
    Alert.alert("Add a photo", undefined, [
      { text: "Camera", onPress: () => void pick("camera") },
      { text: "Library", onPress: () => void pick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const label = preview ? "Replace" : "Add";

  return (
    <View style={styles.block}>
      <View style={[styles.row, disabled && styles.rowDisabled]}>
        <View style={styles.left}>
          <View style={[styles.badge, preview && styles.badgeSaved]}>
            {preview ? (
              <Image source={{ uri: preview }} style={styles.thumb} />
            ) : (
              <ImagePlus size={15} color={colors.ink} />
            )}
          </View>
          <View style={styles.copy}>
            <Text style={styles.title}>Photo</Text>
            <Text style={styles.meta}>{preview ? "Attached" : "Optional · one image"}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {preview ? (
            <Pressable
              onPress={() => onChange(undefined)}
              hitSlop={10}
              disabled={disabled}
              style={styles.removeHit}
            >
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleAdd}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [
              styles.btn,
              preview ? styles.btnReplace : styles.btnAdd,
              pressed && !disabled && styles.btnPressed,
              disabled && styles.btnDisabled,
            ]}
          >
            <Camera
              size={14}
              color={preview ? colors.ink : colors.cream}
              strokeWidth={2.25}
            />
            <Text style={[styles.btnLabel, preview ? styles.btnLabelInk : styles.btnLabelCream]}>
              {label}
            </Text>
          </Pressable>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.softLine,
    borderRadius: radii.hair,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowDisabled: { opacity: 0.55 },
  left: { flexDirection: "row", alignItems: "center", gap: 11, flex: 1, minWidth: 0 },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.butter,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeSaved: {
    backgroundColor: colors.butterDeep,
    padding: 0,
  },
  thumb: { width: 36, height: 36 },
  copy: { flexShrink: 1 },
  title: {
    fontFamily: fonts.sansSemi,
    fontSize: 13,
    color: colors.ink,
  },
  meta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muteSoft,
    marginTop: 2,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },
  removeHit: { paddingVertical: 6, paddingHorizontal: 2 },
  remove: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
    color: colors.muteSoft,
    textDecorationLine: "underline",
    textDecorationColor: colors.butterDeep,
  },
  btn: {
    minHeight: 40,
    minWidth: 98,
    paddingHorizontal: 14,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  btnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  btnAdd: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  btnReplace: {
    backgroundColor: colors.cream,
    borderColor: colors.ink,
  },
  btnDisabled: { opacity: 0.42 },
  btnLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 12,
  },
  btnLabelCream: { color: colors.cream },
  btnLabelInk: { color: colors.ink },
  error: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: "#9b3b3b",
    lineHeight: 16,
  },
});
