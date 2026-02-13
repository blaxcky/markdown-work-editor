import { create } from 'zustand';

export type EditorMode = 'wysiwyg' | 'source';

interface EditorState {
  mode: EditorMode;
  isDirty: boolean;
  wordCount: number;
  charCount: number;
  currentContent: string;
  currentContentByFileId: Record<string, string>;

  setMode: (mode: EditorMode) => void;
  setDirty: (dirty: boolean) => void;
  setWordCount: (count: number) => void;
  setCharCount: (count: number) => void;
  setCurrentContent: (content: string, fileId?: string | null) => void;
  setCurrentFileContent: (fileId: string, content: string) => void;
  hydrateFileContent: (fileId: string, content: string) => void;
  getContentForFile: (fileId: string) => string | undefined;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  mode: 'wysiwyg',
  isDirty: false,
  wordCount: 0,
  charCount: 0,
  currentContent: '',
  currentContentByFileId: {},

  setMode: (mode) => set({ mode }),
  setDirty: (isDirty) => set({ isDirty }),
  setWordCount: (wordCount) => set({ wordCount }),
  setCharCount: (charCount) => set({ charCount }),
  setCurrentContent: (currentContent, fileId) => {
    if (!fileId) {
      set({ currentContent });
      return;
    }

    set((state) => ({
      currentContent,
      currentContentByFileId: {
        ...state.currentContentByFileId,
        [fileId]: currentContent,
      },
    }));
  },
  setCurrentFileContent: (fileId, content) => {
    set((state) => ({
      currentContent: content,
      currentContentByFileId: {
        ...state.currentContentByFileId,
        [fileId]: content,
      },
    }));
  },
  hydrateFileContent: (fileId, content) => {
    set((state) => {
      if (state.currentContentByFileId[fileId] !== undefined) {
        return state;
      }

      return {
        currentContentByFileId: {
          ...state.currentContentByFileId,
          [fileId]: content,
        },
      };
    });
  },
  getContentForFile: (fileId) => get().currentContentByFileId[fileId],
}));
