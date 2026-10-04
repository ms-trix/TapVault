import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii, surface } from '../theme';

/** Inset paper field — fills dead cream with a writing-surface. */
export function PaperSurface({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.shell, style]}>
      <View style={styles.edge} />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

/** Anchors CTAs so they don’t float in empty cream. */
export function FooterRail({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.rail, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.hair,
    overflow: 'hidden',
    position: 'relative',
  },
  edge: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: surface.edge,
    opacity: 0.85,
    zIndex: 2,
  },
  inner: {
    flex: 1,
    paddingLeft: 3,
  },
  rail: {
    backgroundColor: surface.rail,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
});
