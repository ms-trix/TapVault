/**
 * Soft Keepsake feature flags.
 * Flip `splashContinuity` to `false` to restore pre-continuity launch behavior
 * without touching the backup at `mobile/.backup-pre-splash-continuity/`.
 */
export const features = {
  splashContinuity: true,
} as const;
