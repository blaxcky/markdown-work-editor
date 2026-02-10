import { create } from 'zustand';

export type EditorMode = 'wysiwyg' | 'source';

interface EditorState {
  mode: EditorMode;
  isDirty: boolean;
  wordCount: number;
  charCount: number;
  currentContent: string;

  setMode: (mode: EditorMode) => void;
  setDirty: (dirty: boolean) => void;
  setWordCount: (count: number) => void;
  setCharCount: (count: number) => void;
  setCurrentContent: (content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'wysiwyg',
  isDirty: false,
  wordCount: 0,
  charCount: 0,
  currentContent: '',

  setMode: (mode) => set({ mode }),
  setDirty: (isDirty) => set({ isDirty }),
  setWordCount: (wordCount) => set({ wordCount }),
  setCharCount: (charCount) => set({ charCount }),
  setCurrentContent: (currentContent) => set({ currentContent }),
}));
