import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { exportAsZip } from '@/lib/export-zip';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: Props) {
  const files = useWorkspaceStore((s) => s.files);
  const folders = useWorkspaceStore((s) => s.folders);
  const [scope, setScope] = useState<string>('all');

  const handleExport = async () => {
    if (scope === 'all') {
      await exportAsZip(files, folders, '', 'workspace');
    } else {
      const folder = folders.find((f) => f.id === scope);
      await exportAsZip(files, folders, scope, folder?.name ?? 'export');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Als ZIP exportieren</DialogTitle>
          <DialogDescription>Wähle was exportiert werden soll.</DialogDescription>
        </DialogHeader>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Gesamter Workspace</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleExport}>Exportieren</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
