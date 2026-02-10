import JSZip from 'jszip';
import { db } from '@/db/database';
import { generateId } from '@/lib/id';
import type { FileItem, FolderItem } from '@/db/types';

function normalizeZipPath(rawPath: string): string | null {
  const normalized = rawPath
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  if (!normalized) return null;

  const segments = normalized.split('/');
  if (segments[0] === '__MACOSX' || segments[0].startsWith('.')) return null;
  if (segments.some((segment) => segment === '.' || segment === '..' || segment.length === 0)) {
    return null;
  }

  return segments.join('/');
}

export async function importFromZip(
  file: File,
  targetParentId: string = ''
): Promise<{ fileCount: number; folderCount: number }> {
  const zip = await JSZip.loadAsync(file);
  const now = Date.now();

  const folderMap = new Map<string, string>(); // path -> id
  const newFolders: FolderItem[] = [];
  const newFiles: FileItem[] = [];

  // Collect all paths
  const entries: { path: string; isDir: boolean; content: () => Promise<string> }[] = [];

  zip.forEach((relativePath, zipEntry) => {
    const path = normalizeZipPath(relativePath);
    if (!path) return;

    entries.push({
      path,
      isDir: zipEntry.dir,
      content: () => zipEntry.async('string'),
    });
  });

  // Sort so directories come first
  entries.sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.path.localeCompare(b.path);
  });

  function getOrCreateFolder(folderPath: string): string {
    if (!folderPath || folderPath === '/') return targetParentId;

    const existing = folderMap.get(folderPath);
    if (existing) return existing;

    const parts = folderPath.replace(/\/$/, '').split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');
    const parentId = parentPath ? getOrCreateFolder(parentPath) : targetParentId;

    const id = generateId();
    folderMap.set(folderPath, id);
    newFolders.push({
      id,
      name,
      parentId,
      createdAt: now,
      updatedAt: now,
      order: newFolders.filter((f) => f.parentId === parentId).length,
      isExpanded: true,
    });
    return id;
  }

  for (const entry of entries) {
    if (entry.isDir) {
      getOrCreateFolder(entry.path);
    } else {
      const parts = entry.path.split('/');
      const fileName = parts[parts.length - 1];
      if (!fileName) continue;

      const folderPath = parts.slice(0, -1).join('/');
      const parentId = folderPath ? getOrCreateFolder(folderPath) : targetParentId;
      const content = await entry.content();

      newFiles.push({
        id: generateId(),
        name: fileName,
        content,
        parentId,
        createdAt: now,
        updatedAt: now,
        order: newFiles.filter((f) => f.parentId === parentId).length,
      });
    }
  }

  await db.transaction('rw', db.files, db.folders, async () => {
    await db.folders.bulkAdd(newFolders);
    await db.files.bulkAdd(newFiles);
  });

  return { fileCount: newFiles.length, folderCount: newFolders.length };
}
