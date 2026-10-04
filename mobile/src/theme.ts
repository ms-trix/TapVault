export const colors = {
  cream: '#faf6eb',
  paper: '#fffcf4',
  butter: '#e6d59a',
  butterDeep: '#e8d89a',
  border: '#e8dfc4',
  softLine: '#e0d6b8',
  ink: '#3f392c',
  mute: '#6f6756',
  muteSoft: '#8a8170',
} as const;

export const fonts = {
  display: 'InstrumentSerif_400Regular',
  sans: 'DMSans_400Regular',
  sansSemi: 'DMSans_600SemiBold',
} as const;

export const type = {
  displayHero: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.4 },
  displayTitle: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, letterSpacing: -0.3 },
  displaySign: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  brand: { fontFamily: fonts.display, fontSize: 28, lineHeight: 30, letterSpacing: -0.2 },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22 },
  bodyLarge: { fontFamily: fonts.sans, fontSize: 18, lineHeight: 28 },
  ui: { fontFamily: fonts.sansSemi, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  micro: { fontFamily: fonts.sans, fontSize: 11, lineHeight: 16 },
} as const;

export const space = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  hair: 2,
  control: 3,
  mark: 8,
  tag: 16,
  pill: 999,
} as const;

export const timing = {
  detectMs: 1500,
  foundHoldMs: 1300,
  unlockMs: 920,
  enterMs: 280,
  pressMs: 120,
} as const;
