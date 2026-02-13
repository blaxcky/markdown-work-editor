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
  const setDirty = useEditorStore((s) => s.setDirty);
  const setWordCount = useEditorStore((s) => s.setWordCount);
  const setCharCount = useEditorStore((s) => s.setCharCount);

  const { flush } = useAutoSave();
  useKeyboardShortcuts();

  const activeFile = files.find((f) => f.id === activeFileId);
  const prevFileIdRef = useRef<string | null>(null);
  const draftsByFileRef = useRef<Record<string, string>>({});

  const updateCounts = useCallback(
    (text: string) => {
      setCharCount(text.length);
      const trimmed = text.trim();
      setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
    },
    [setCharCount, setWordCount]
  );

  // Avoid expensive whole-document word counting on every single key press.
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCounts(currentContent);
    }, 120);

    return () => clearTimeout(timer);
  }, [currentContent, updateCounts]);

  // Load file content when active file changes
  useEffect(() => {
    if (activeFileId !== prevFileIdRef.current) {
      const previousFileId = prevFileIdRef.current;

      // Flush previous file's changes
      if (previousFileId) {
        const previousDraft = draftsByFileRef.current[previousFileId] ?? currentContent;
        void flush({ fileId: previousFileId, content: previousDraft });
      }

      prevFileIdRef.current = activeFileId;
      if (activeFile) {
        const currentDraft = draftsByFileRef.current[activeFile.id] ?? activeFile.content;
        draftsByFileRef.current[activeFile.id] = currentDraft;
        setCurrentContent(currentDraft);
        setDirty(false);
      }
    }
  }, [activeFileId, activeFile, currentContent, flush, setCurrentContent, setDirty]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      const fileId = useWorkspaceStore.getState().activeFileId;
      if (fileId) {
        draftsByFileRef.current[fileId] = newContent;
      }
      setCurrentContent(newContent);
      setDirty(true);
    },
    [setCurrentContent, setDirty]
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
            initialValue={draftsByFileRef.current[activeFile.id] ?? activeFile.content}
            onChange={handleContentChange}
          />
        ) : (
          <SourceEditor
            value={currentContent}
            onChange={handleContentChange}
          />
        )}
      </div>
      <EditorStatusBar />
    </>
  );
}
