import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import type { TreeNode } from '@/lib/tree-utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: TreeNode;
}

export function RenameDialog({ open, onOpenChange, node }: Props) {
  const [name, setName] = useState(node.name);
  const updateFile = useWorkspaceStore((s) => s.updateFile);
  const updateFolder = useWorkspaceStore((s) => s.updateFolder);

  useEffect(() => {
    if (open) setName(node.name);
  }, [open, node.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    if (node.type === 'file') {
      updateFile(node.id, { name: trimmed });
    } else {
      updateFolder(node.id, { name: trimmed });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Umbenennen</DialogTitle>
          <DialogDescription>
            Gib einen neuen Namen ein.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Umbenennen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
