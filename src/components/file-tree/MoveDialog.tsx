import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import type { TreeNode } from '@/lib/tree-utils';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TreeNode;
}

export function MoveDialog({ open, onOpenChange, node }: Props) {
  const folders = useWorkspaceStore((s) => s.folders);
  const updateFile = useWorkspaceStore((s) => s.updateFile);
  const updateFolder = useWorkspaceStore((s) => s.updateFolder);
  const [selectedParent, setSelectedParent] = useState<string>('');

  // Filter out the node itself and its descendants
  const getDescendantIds = (id: string): Set<string> => {
    const ids = new Set<string>();
    ids.add(id);
    folders.filter((f) => f.parentId === id).forEach((f) => {
      for (const did of getDescendantIds(f.id)) ids.add(did);
    });
    return ids;
  };

  const excludeIds = node.type === 'folder' ? getDescendantIds(node.id) : new Set<string>();
  const availableFolders = folders.filter(
    (f) => !excludeIds.has(f.id) && f.id !== node.parentId
  );

  const handleMove = () => {
    if (node.type === 'file') {
      updateFile(node.id, { parentId: selectedParent });
    } else {
      updateFolder(node.id, { parentId: selectedParent });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Verschieben</DialogTitle>
          <DialogDescription>
            Wähle den Zielordner für "{node.name}".
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-accent',
              selectedParent === '' && 'bg-accent font-medium'
            )}
            onClick={() => setSelectedParent('')}
          >
            <Folder className="h-4 w-4" />
            Root (Hauptebene)
          </div>
          {availableFolders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm hover:bg-accent',
                selectedParent === folder.id && 'bg-accent font-medium'
              )}
              onClick={() => setSelectedParent(folder.id)}
            >
              <Folder className="h-4 w-4" />
              {folder.name}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleMove}>
            Verschieben
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
