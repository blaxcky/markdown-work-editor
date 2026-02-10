import { FilePlus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkspaceStore } from '@/stores/use-workspace-store';

export function SidebarHeader() {
  const createFile = useWorkspaceStore((s) => s.createFile);
  const createFolder = useWorkspaceStore((s) => s.createFolder);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
      <span className="text-sm font-semibold truncate">Workspace</span>
      <div className="flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => createFile('Neue Datei', '')}
            >
              <FilePlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Neue Datei</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => createFolder('Neuer Ordner')}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Neuer Ordner</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
