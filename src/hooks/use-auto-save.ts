import { useEffect, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { useEditorStore } from '@/stores/use-editor-store';

const AUTO_SAVE_DELAY = 1000;

interface FlushOptions {
  fileId?: string | null;
  content?: string;
  force?: boolean;
}

export function useAutoSave() {
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const updateFile = useWorkspaceStore((s) => s.updateFile);
  const currentContent = useEditorStore((s) => s.currentContent);
  const currentContentByFileId = useEditorStore((s) => s.currentContentByFileId);
  const isDirty = useEditorStore((s) => s.isDirty);
  const setDirty = useEditorStore((s) => s.setDirty);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (options: FlushOptions = {}) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const editorState = useEditorStore.getState();
    const targetFileId = options.fileId ?? activeFileId;
    const shouldSave = options.force ? true : editorState.isDirty;
    if (!targetFileId || !shouldSave) return;

    const contentToSave = options.content
      ?? (targetFileId ? editorState.currentContentByFileId[targetFileId] : undefined)
      ?? editorState.currentContent;
    await updateFile(targetFileId, { content: contentToSave });

    if (useWorkspaceStore.getState().activeFileId === targetFileId) {
      setDirty(false);
    }
  }, [activeFileId, updateFile, setDirty]);

  useEffect(() => {
    if (!isDirty || !activeFileId) return;

    const scheduledFileId = activeFileId;
    const scheduledContent = currentContentByFileId[scheduledFileId] ?? currentContent;

    timerRef.current = setTimeout(async () => {
      await updateFile(scheduledFileId, { content: scheduledContent });
      if (useWorkspaceStore.getState().activeFileId === scheduledFileId) {
        setDirty(false);
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, activeFileId, currentContent, currentContentByFileId, updateFile, setDirty]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      const editorState = useEditorStore.getState();
      const fileId = useWorkspaceStore.getState().activeFileId;
      if (fileId && editorState.isDirty) {
        const content = editorState.currentContentByFileId[fileId] ?? editorState.currentContent;
        void updateFile(fileId, { content });
      }
    };
  }, [updateFile]);

  return { flush };
}
