import { db } from './database';
import type { FileItem } from './types';
import { generateId } from '@/lib/id';

export async function getAllFiles(): Promise<FileItem[]> {
  return db.files.toArray();
}

export async function getFile(id: string): Promise<FileItem | undefined> {
  return db.files.get(id);
}

export async function createFile(
  name: string,
  content: string,
  parentId: string = '',
  order?: number
): Promise<FileItem> {
  if (order === undefined) {
    const siblings = await db.files.where('parentId').equals(parentId).toArray();
    const folderSiblings = await db.folders.where('parentId').equals(parentId).toArray();
    order = siblings.length + folderSiblings.length;
  }

  const now = Date.now();
  const file: FileItem = {
    id: generateId(),
    name: name.endsWith('.md') ? name : `${name}.md`,
    content,
    parentId,
    createdAt: now,
    updatedAt: now,
    order,
  };

  await db.files.add(file);
  return file;
}

export async function updateFile(id: string, changes: Partial<Pick<FileItem, 'name' | 'content' | 'parentId' | 'order'>>): Promise<void> {
  await db.files.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteFile(id: string): Promise<void> {
  await db.files.delete(id);
}

export async function getFilesInFolder(parentId: string): Promise<FileItem[]> {
  return db.files.where('parentId').equals(parentId).sortBy('order');
}
