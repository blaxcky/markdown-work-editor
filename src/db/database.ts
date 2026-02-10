import Dexie, { type Table } from 'dexie';
import type { FileItem, FolderItem, Setting } from './types';

export class AppDatabase extends Dexie {
  files!: Table<FileItem, string>;
  folders!: Table<FolderItem, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super('MarkdownWorkEditor');

    this.version(1).stores({
      files: 'id, parentId, name, updatedAt, order',
      folders: 'id, parentId, name, order',
      settings: 'key',
    });
  }
}

export const db = new AppDatabase();
