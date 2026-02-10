import { useEditorStore } from '@/stores/use-editor-store';
import { useWorkspaceStore } from '@/stores/use-workspace-store';

export function EditorStatusBar() {
  const wordCount = useEditorStore((s) => s.wordCount);
  const charCount = useEditorStore((s) => s.charCount);
  const isDirty = useEditorStore((s) => s.isDirty);
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const files = useWorkspaceStore((s) => s.files);

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="flex items-center justify-between px-3 py-1 border-t border-border bg-muted/50 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>{wordCount} Wörter</span>
        <span>{charCount} Zeichen</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{isDirty ? 'Nicht gespeichert' : 'Gespeichert'}</span>
        {activeFile && (
          <span>
            Geändert: {new Date(activeFile.updatedAt).toLocaleString('de-DE')}
          </span>
        )}
      </div>
    </div>
  );
}
