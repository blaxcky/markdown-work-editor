import { useEditorStore, type EditorMode } from '@/stores/use-editor-store';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { useUIStore } from '@/stores/use-ui-store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, Code, Download, FileDown, PanelLeft } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  onModeChange: (mode: EditorMode) => void;
}

export function EditorToolbar({ onModeChange }: Props) {
  const mode = useEditorStore((s) => s.mode);
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const files = useWorkspaceStore((s) => s.files);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const openDialog = useUIStore((s) => s.openDialog);

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-background">
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSidebar}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sidebar ein/ausblenden</TooltipContent>
        </Tooltip>
        {activeFile && (
          <span className="text-sm font-medium truncate max-w-[200px]">
            {activeFile.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className="flex bg-muted rounded-md p-0.5">
          <Button
            variant={mode === 'wysiwyg' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onModeChange('wysiwyg')}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            WYSIWYG
          </Button>
          <Button
            variant={mode === 'source' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onModeChange('source')}
          >
            <Code className="h-3.5 w-3.5 mr-1" />
            Source
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              if (!activeFile) return;
              const blob = new Blob([useEditorStore.getState().currentContent], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = activeFile.name;
              a.click();
              URL.revokeObjectURL(url);
            }}>
              <FileDown className="h-4 w-4 mr-2" />
              Als Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog('pdfExport')}>
              <FileDown className="h-4 w-4 mr-2" />
              Als PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
