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

  const updateCounts = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      setWordCount(trimmed ? trimmed.split(/\s+/).length : 0);
      setCharCount(text.length);
    },
    [setWordCount, setCharCount]
  );

  // Load file content when active file changes
  useEffect(() => {
    if (activeFileId !== prevFileIdRef.current) {
      // Flush previous file's changes
      if (prevFileIdRef.current) {
        void flush({ fileId: prevFileIdRef.current, content: currentContent });
      }
      prevFileIdRef.current = activeFileId;
      if (activeFile) {
        setCurrentContent(activeFile.content);
        setDirty(false);
        updateCounts(activeFile.content);
      }
    }
  }, [activeFileId, activeFile, currentContent, flush, setCurrentContent, setDirty, updateCounts]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setCurrentContent(newContent);
      setDirty(true);
      updateCounts(newContent);
    },
    [setCurrentContent, setDirty, updateCounts]
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
            initialValue={currentContent}
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
