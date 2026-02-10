import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { db } from '@/db/database';
import type { FileItem, FolderItem, Setting } from '@/db/types';

interface BackupMetadata {
  version: 1;
  createdAt: string;
  fileCount: number;
  folderCount: number;
}

export async function createBackup() {
  const files = await db.files.toArray();
  const folders = await db.folders.toArray();
  const settings = await db.settings.toArray();

  const zip = new JSZip();

  // Metadata
  const metadata: BackupMetadata = {
    version: 1,
    createdAt: new Date().toISOString(),
    fileCount: files.length,
    folderCount: folders.length,
  };
  zip.file('_backup_metadata.json', JSON.stringify(metadata, null, 2));

  // Raw JSON data for perfect restoration
  const dataFolder = zip.folder('_data')!;
  dataFolder.file('files.json', JSON.stringify(files, null, 2));
  dataFolder.file('folders.json', JSON.stringify(folders, null, 2));
  dataFolder.file('settings.json', JSON.stringify(settings, null, 2));

  // Human-readable markdown files
  const folderMap = new Map<string, FolderItem>();
  for (const f of folders) folderMap.set(f.id, f);

  function getPath(parentId: string): string {
    if (parentId === '') return '';
    const folder = folderMap.get(parentId);
    if (!folder) return '';
    const parentPath = getPath(folder.parentId);
    return parentPath ? `${parentPath}/${folder.name}` : folder.name;
  }

  for (const folder of folders) {
    const path = getPath(folder.id);
    if (path) zip.folder(path);
  }

  for (const file of files) {
    const folderPath = getPath(file.parentId);
    const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
    zip.file(filePath, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  saveAs(blob, `markdown-editor-backup-${timestamp}.zip`);
}

export async function restoreBackup(file: File): Promise<void> {
  const zip = await JSZip.loadAsync(file);

  // Validate
  const metadataFile = zip.file('_backup_metadata.json');
  if (!metadataFile) {
    throw new Error('Ungültiges Backup: _backup_metadata.json fehlt');
  }

  const metadata: BackupMetadata = JSON.parse(await metadataFile.async('string'));
  if (metadata.version !== 1) {
    throw new Error(`Nicht unterstützte Backup-Version: ${metadata.version}`);
  }

  const dataFolder = zip.folder('_data');
  if (!dataFolder) {
    throw new Error('Ungültiges Backup: _data Ordner fehlt');
  }

  const filesJson = zip.file('_data/files.json');
  const foldersJson = zip.file('_data/folders.json');
  const settingsJson = zip.file('_data/settings.json');

  if (!filesJson || !foldersJson) {
    throw new Error('Ungültiges Backup: Datendateien fehlen');
  }

  const files: FileItem[] = JSON.parse(await filesJson.async('string'));
  const folders: FolderItem[] = JSON.parse(await foldersJson.async('string'));
  const settings: Setting[] = settingsJson
    ? JSON.parse(await settingsJson.async('string'))
    : [];

  // Clear existing data and restore
  await db.transaction('rw', db.files, db.folders, db.settings, async () => {
    await db.files.clear();
    await db.folders.clear();
    await db.settings.clear();

    await db.folders.bulkAdd(folders);
    await db.files.bulkAdd(files);
    if (settings.length > 0) {
      await db.settings.bulkAdd(settings);
    }
  });
}
