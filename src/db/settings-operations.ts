import { db } from './database';
import type { Setting } from './types';

export async function getSetting(key: string): Promise<string | undefined> {
  const setting = await db.settings.get(key);
  return setting?.value;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await db.settings.put({ key, value });
}

export async function getAllSettings(): Promise<Setting[]> {
  return db.settings.toArray();
}

export async function deleteSetting(key: string): Promise<void> {
  await db.settings.delete(key);
}
