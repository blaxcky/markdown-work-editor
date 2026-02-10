import { useRef, useState } from 'react';
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
import { importFromZip } from '@/lib/import-zip';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROOT_FOLDER_VALUE = '__root__';

export function ImportDialog({ open, onOpenChange }: Props) {
  const folders = useWorkspaceStore((s) => s.folders);
  const loadWorkspace = useWorkspaceStore((s) => s.loadWorkspace);
  const [targetFolder, setTargetFolder] = useState<string>(ROOT_FOLDER_VALUE);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    try {
      const parentId = targetFolder === ROOT_FOLDER_VALUE ? '' : targetFolder;
      await importFromZip(selectedFile, parentId);
      await loadWorkspace();
      onOpenChange(false);
    } finally {
      setImporting(false);
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>ZIP importieren</DialogTitle>
          <DialogDescription>Wähle eine ZIP-Datei und den Zielordner.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => inputRef.current?.click()}
            >
              {selectedFile ? selectedFile.name : 'ZIP-Datei auswählen...'}
            </Button>
          </div>
          <Select value={targetFolder} onValueChange={setTargetFolder}>
            <SelectTrigger>
              <SelectValue placeholder="Zielordner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROOT_FOLDER_VALUE}>Root (Hauptebene)</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || importing}>
            {importing ? 'Importiere...' : 'Importieren'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
