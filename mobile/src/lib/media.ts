import * as FileSystem from "expo-file-system/legacy";

const MEDIA_DIR = "tapvault-media";

function docsRoot(): string | null {
  return FileSystem.documentDirectory;
}

function mediaDirUri(): string | null {
  const root = docsRoot();
  if (!root) return null;
  return `${root}${MEDIA_DIR}/`;
}

async function ensureMediaDir(): Promise<string | null> {
  const dir = mediaDirUri();
  if (!dir) return null;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

function extFromUri(uri: string, fallback: string): string {
  const clean = uri.split("?")[0] ?? uri;
  const match = /\.([a-zA-Z0-9]+)$/.exec(clean);
  return match?.[1]?.toLowerCase() ?? fallback;
}

/** Copy a temp URI into documents; returns relative path under tapvault-media/. */
export async function persistMediaFile(
  sourceUri: string | undefined,
  kind: "photo" | "voice",
): Promise<string | undefined> {
  if (!sourceUri) return undefined;
  if (sourceUri.startsWith(`${MEDIA_DIR}/`)) return sourceUri;

  const dir = await ensureMediaDir();
  if (!dir) return sourceUri;

  const ext = kind === "photo" ? extFromUri(sourceUri, "jpg") : extFromUri(sourceUri, "m4a");
  const name = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const dest = `${dir}${name}`;
  try {
    const info = await FileSystem.getInfoAsync(sourceUri);
    if (!info.exists) return sourceUri;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    const copied = await FileSystem.getInfoAsync(dest);
    if (!copied.exists) return sourceUri;
    return `${MEDIA_DIR}/${name}`;
  } catch {
    return sourceUri;
  }
}

/** Resolve stored relative path (or legacy absolute URI) to a usable file URI. */
export function resolveMediaUri(stored?: string): string | undefined {
  if (!stored) return undefined;
  if (
    stored.startsWith("file://") ||
    stored.startsWith("content://") ||
    stored.startsWith("http")
  ) {
    return stored;
  }
  const root = docsRoot();
  if (!root) return stored;
  if (stored.startsWith(`${MEDIA_DIR}/`)) return `${root}${stored}`;
  return `${root}${stored}`;
}

export async function deleteMediaFile(stored?: string): Promise<void> {
  if (!stored || !stored.startsWith(`${MEDIA_DIR}/`)) return;
  const root = docsRoot();
  if (!root) return;
  const uri = `${root}${stored}`;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore
  }
}
