import { create } from 'zustand';
import type { FileItem, FolderItem } from '@/db/types';
import * as fileOps from '@/db/file-operations';
import * as folderOps from '@/db/folder-operations';

interface WorkspaceState {
  files: FileItem[];
  folders: FolderItem[];
  activeFileId: string | null;

  loadWorkspace: () => Promise<void>;
  createFile: (name: string, content: string, parentId?: string) => Promise<FileItem>;
  updateFile: (id: string, changes: Partial<Pick<FileItem, 'name' | 'content' | 'parentId' | 'order'>>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  createFolder: (name: string, parentId?: string) => Promise<FolderItem>;
  updateFolder: (id: string, changes: Partial<Pick<FolderItem, 'name' | 'parentId' | 'order' | 'isExpanded'>>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setActiveFile: (id: string | null) => void;
  toggleFolderExpanded: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  files: [],
  folders: [],
  activeFileId: null,

  loadWorkspace: async () => {
    const [files, folders] = await Promise.all([
      fileOps.getAllFiles(),
      folderOps.getAllFolders(),
    ]);
    set({ files, folders });
  },

  createFile: async (name, content, parentId = '') => {
    const file = await fileOps.createFile(name, content, parentId);
    set((s) => ({ files: [...s.files, file], activeFileId: file.id }));
    return file;
  },

  updateFile: async (id, changes) => {
    await fileOps.updateFile(id, changes);
    set((s) => ({
      files: s.files.map((f) =>
        f.id === id ? { ...f, ...changes, updatedAt: Date.now() } : f
      ),
    }));
  },

  deleteFile: async (id) => {
    await fileOps.deleteFile(id);
    set((s) => ({
      files: s.files.filter((f) => f.id !== id),
      activeFileId: s.activeFileId === id ? null : s.activeFileId,
    }));
  },

  createFolder: async (name, parentId = '') => {
    const folder = await folderOps.createFolder(name, parentId);
    set((s) => ({ folders: [...s.folders, folder] }));
    return folder;
  },

  updateFolder: async (id, changes) => {
    await folderOps.updateFolder(id, changes);
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === id ? { ...f, ...changes, updatedAt: Date.now() } : f
      ),
    }));
  },

  deleteFolder: async (id) => {
    // Collect all descendant IDs before deleting
    const allFolderIds = new Set<string>();
    const collectDescendants = (folderId: string) => {
      allFolderIds.add(folderId);
      get().folders
        .filter((f) => f.parentId === folderId)
        .forEach((f) => collectDescendants(f.id));
    };
    collectDescendants(id);

    await folderOps.deleteFolderRecursive(id);

    set((s) => ({
      folders: s.folders.filter((f) => !allFolderIds.has(f.id)),
      files: s.files.filter((f) => !allFolderIds.has(f.parentId)),
      activeFileId:
        s.activeFileId && s.files.find((f) => f.id === s.activeFileId && allFolderIds.has(f.parentId))
          ? null
          : s.activeFileId,
    }));
  },

  setActiveFile: (id) => set({ activeFileId: id }),

  toggleFolderExpanded: async (id) => {
    const folder = get().folders.find((f) => f.id === id);
    if (!folder) return;
    const newExpanded = !folder.isExpanded;
    await folderOps.updateFolder(id, { isExpanded: newExpanded });
    set((s) => ({
      folders: s.folders.map((f) =>
        f.id === id ? { ...f, isExpanded: newExpanded } : f
      ),
    }));
  },
}));
