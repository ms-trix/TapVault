import AsyncStorage from "@react-native-async-storage/async-storage";
import { demoNote, type Note } from "../types";

const STORAGE_KEY = "tapvault-vaults-v1";
export const DEMO_TAG_ID = "demo-tag-001";

type VaultMap = Record<string, Note>;

async function readAll(): Promise<VaultMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as VaultMap;
  } catch {
    return {};
  }
}

async function writeAll(map: VaultMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** Ensure the pitch demo vault always exists. */
export async function ensurePreseed(): Promise<Note> {
  const map = await readAll();
  if (!map[DEMO_TAG_ID]) {
    map[DEMO_TAG_ID] = demoNote;
    await writeAll(map);
  }
  return map[DEMO_TAG_ID];
}

export async function saveVault(tagId: string, note: Note) {
  const map = await readAll();
  map[tagId] = note;
  await writeAll(map);
}

export async function loadVault(tagId: string): Promise<Note | null> {
  const map = await readAll();
  return map[tagId] ?? null;
}

/** Restore the pitch demo note (overwrites DEMO_TAG_ID). */
export async function resetDemoVault(): Promise<Note> {
  const map = await readAll();
  map[DEMO_TAG_ID] = demoNote;
  await writeAll(map);
  return demoNote;
}
