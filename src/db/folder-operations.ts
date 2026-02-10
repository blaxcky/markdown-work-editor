import { db } from './database';
import type { FolderItem } from './types';
import { generateId } from '@/lib/id';

export async function getAllFolders(): Promise<FolderItem[]> {
  return db.folders.toArray();
}

export async function getFolder(id: string): Promise<FolderItem | undefined> {
  return db.folders.get(id);
}

export async function createFolder(
  name: string,
  parentId: string = '',
  order?: number
): Promise<FolderItem> {
  if (order === undefined) {
    const siblings = await db.files.where('parentId').equals(parentId).toArray();
    const folderSiblings = await db.folders.where('parentId').equals(parentId).toArray();
    order = siblings.length + folderSiblings.length;
  }

  const now = Date.now();
  const folder: FolderItem = {
    id: generateId(),
    name,
    parentId,
    createdAt: now,
    updatedAt: now,
    order,
    isExpanded: true,
  };

  await db.folders.add(folder);
  return folder;
}

export async function updateFolder(id: string, changes: Partial<Pick<FolderItem, 'name' | 'parentId' | 'order' | 'isExpanded'>>): Promise<void> {
  await db.folders.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteFolderRecursive(id: string): Promise<void> {
  await db.transaction('rw', db.files, db.folders, async () => {
    const childFolders = await db.folders.where('parentId').equals(id).toArray();
    for (const child of childFolders) {
      await deleteFolderRecursive(child.id);
    }
    await db.files.where('parentId').equals(id).delete();
    await db.folders.delete(id);
  });
}

export async function getFoldersInFolder(parentId: string): Promise<FolderItem[]> {
  return db.folders.where('parentId').equals(parentId).sortBy('order');
}
