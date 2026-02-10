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
import { useEditorStore } from '@/stores/use-editor-store';
import { exportSinglePdf, exportMultiplePdf, type PdfOptions } from '@/lib/export-pdf';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfExportDialog({ open, onOpenChange }: Props) {
  const files = useWorkspaceStore((s) => s.files);
  const folders = useWorkspaceStore((s) => s.folders);
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const currentContent = useEditorStore((s) => s.currentContent);
  const [scope, setScope] = useState<string>('current');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [exporting, setExporting] = useState(false);

  const activeFile = files.find((f) => f.id === activeFileId);

  const getFolderDescendantIds = (rootFolderId: string): Set<string> => {
    const descendantIds = new Set<string>();
    const stack = [rootFolderId];

    while (stack.length > 0) {
      const folderId = stack.pop();
      if (!folderId || descendantIds.has(folderId)) continue;

      descendantIds.add(folderId);
      for (const folder of folders) {
        if (folder.parentId === folderId) {
          stack.push(folder.id);
        }
      }
    }

    return descendantIds;
  };

  const toPdfFile = (file: { id: string; name: string; content: string }) => ({
    name: file.name,
    content: file.id === activeFileId ? currentContent : file.content,
  });

  const handleExport = async () => {
    setExporting(true);
    const options: PdfOptions = { pageSize, orientation };

    try {
      if (scope === 'current' && activeFile) {
        await exportSinglePdf(currentContent, activeFile.name, options);
      } else if (scope === 'all') {
        await exportMultiplePdf(files.map(toPdfFile), 'workspace.pdf', options);
      } else {
        const descendantIds = getFolderDescendantIds(scope);
        const folderFiles = files.filter((f) => descendantIds.has(f.parentId));
        const folder = folders.find((f) => f.id === scope);
        await exportMultiplePdf(
          folderFiles.map(toPdfFile),
          `${folder?.name ?? 'export'}.pdf`,
          options
        );
      }
      onOpenChange(false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>PDF exportieren</DialogTitle>
          <DialogDescription>Wähle Umfang und Format.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activeFile && (
                <SelectItem value="current">Aktuelle Datei ({activeFile.name})</SelectItem>
              )}
              <SelectItem value="all">Alle Dateien</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  Ordner: {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-3">
            <Select value={pageSize} onValueChange={(v) => setPageSize(v as 'a4' | 'letter')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a4">A4</SelectItem>
                <SelectItem value="letter">Letter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={orientation} onValueChange={(v) => setOrientation(v as 'portrait' | 'landscape')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portrait">Hochformat</SelectItem>
                <SelectItem value="landscape">Querformat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exportiere...' : 'PDF erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
