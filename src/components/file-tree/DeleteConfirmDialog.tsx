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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TreeNode;
}

export function DeleteConfirmDialog({ open, onOpenChange, node }: Props) {
  const deleteFile = useWorkspaceStore((s) => s.deleteFile);
  const deleteFolder = useWorkspaceStore((s) => s.deleteFolder);

  const handleDelete = () => {
    if (node.type === 'file') {
      deleteFile(node.id);
    } else {
      deleteFolder(node.id);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Löschen bestätigen</DialogTitle>
          <DialogDescription>
            {node.type === 'folder'
              ? `Der Ordner "${node.name}" und alle enthaltenen Dateien werden unwiderruflich gelöscht.`
              : `Die Datei "${node.name}" wird unwiderruflich gelöscht.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
