import { useCallback, useEffect, useRef } from 'react';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { useEditorStore, type EditorMode } from '@/stores/use-editor-store';
import { useAutoSave } from '@/hooks/use-auto-save';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { EmptyState } from './EmptyState';
import { EditorToolbar } from './EditorToolbar';
import { EditorStatusBar } from './EditorStatusBar';
import { MilkdownEditor } from './MilkdownEditor';
import { SourceEditor } from './SourceEditor';

export function EditorArea() {
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const files = useWorkspaceStore((s) => s.files);
  const mode = useEditorStore((s) => s.mode);
  const setMode = useEditorStore((s) => s.setMode);
  const currentContent = useEditorStore((s) => s.currentContent);
  const setCurrentContent = useEditorStore((s) => s.setCurrentContent);
  const currentContentByFileId = useEditorStore((s) => s.currentContentByFileId);
  const setCurrentFileContent = useEditorStore((s) => s.setCurrentFileContent);
  const hydrateFileContent = useEditorStore((s) => s.hydrateFileContent);
  const setDirty = useEditorStore((s) => s.setDirty);
  const setWordCount = useEditorStore((s) => s.setWordCount);
  const setCharCount = useEditorStore((s) => s.setCharCount);

  const { flush } = useAutoSave();
  useKeyboardShortcuts();

  const activeFile = files.find((f) => f.id === activeFileId);
  const prevFileIdRef = useRef<string | null>(null);
  const isSyncingRef = useRef(false);

  const updateCounts = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
      setCharCount(text.length);
    },
    [setWordCount, setCharCount]
  );

  // Keep drafts hydrated from persisted file contents.
  useEffect(() => {
    for (const file of files) {
      hydrateFileContent(file.id, file.content);
    }
  }, [files, hydrateFileContent]);

  // Load file content when active file changes
  useEffect(() => {
    if (activeFileId === prevFileIdRef.current) return;

    const syncActiveFile = async () => {
      isSyncingRef.current = true;

      const prevFileId = prevFileIdRef.current;
      if (prevFileId) {
        const previousDraft = useEditorStore.getState().currentContentByFileId[prevFileId];
        if (previousDraft !== undefined) {
          await flush({ fileId: prevFileId, content: previousDraft });
        }
      }

      prevFileIdRef.current = activeFileId;
      if (activeFile && activeFileId) {
        const currentDraft = useEditorStore.getState().currentContentByFileId[activeFileId] ?? activeFile.content;
        setCurrentFileContent(activeFileId, currentDraft);
        setDirty(false);
        updateCounts(currentDraft);
      }

      isSyncingRef.current = false;
    };

    void syncActiveFile();

    return () => {
      isSyncingRef.current = true;
    };
  }, [activeFileId, activeFile, flush, setCurrentFileContent, setDirty, updateCounts]);

  const editorValue = activeFileId
    ? currentContentByFileId[activeFileId] ?? activeFile?.content ?? ''
    : '';

  useEffect(() => {
    if (activeFileId && editorValue !== currentContent) {
      setCurrentContent(editorValue);
    }
  }, [activeFileId, currentContent, editorValue, setCurrentContent]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!activeFileId || isSyncingRef.current) return;
      setCurrentContent(newContent, activeFileId);
      setDirty(true);
      updateCounts(newContent);
    },
    [activeFileId, setCurrentContent, setDirty, updateCounts]
  );

  const handleModeChange = useCallback(
    async (newMode: EditorMode) => {
      if (newMode === mode) return;
      await flush();
      setMode(newMode);
    },
    [mode, flush, setMode]
  );

  if (!activeFileId || !activeFile) {
    return <EmptyState />;
  }

  return (
    <>
      <EditorToolbar onModeChange={handleModeChange} />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {mode === 'wysiwyg' ? (
          <MilkdownEditor
            key={activeFileId}
            initialValue={editorValue}
            onChange={handleContentChange}
          />
        ) : (
          <SourceEditor
            value={editorValue}
            onChange={handleContentChange}
          />
        )}
      </div>
      <EditorStatusBar />
    </>
  );
}
