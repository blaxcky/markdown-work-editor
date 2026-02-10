import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBackup, restoreBackup } from '@/lib/backup';
import { useWorkspaceStore } from '@/stores/use-workspace-store';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackupDialog({ open, onOpenChange }: Props) {
  const loadWorkspace = useWorkspaceStore((s) => s.loadWorkspace);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [working, setWorking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setWorking(true);
    setStatus('');
    try {
      await createBackup();
      setStatus('Backup erfolgreich erstellt!');
    } catch (e) {
      setStatus(`Fehler: ${e instanceof Error ? e.message : 'Unbekannt'}`);
    } finally {
      setWorking(false);
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    setWorking(true);
    setStatus('');
    try {
      await restoreBackup(restoreFile);
      await loadWorkspace();
      setStatus('Backup erfolgreich wiederhergestellt!');
      setRestoreFile(null);
    } catch (e) {
      setStatus(`Fehler: ${e instanceof Error ? e.message : 'Unbekannt'}`);
    } finally {
      setWorking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Backup</DialogTitle>
          <DialogDescription>Erstelle oder stelle ein Backup wieder her.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="create">
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1">Erstellen</TabsTrigger>
            <TabsTrigger value="restore" className="flex-1">Wiederherstellen</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Erstellt eine ZIP-Datei mit allen Dateien, Ordnern und Einstellungen.
            </p>
            <Button onClick={handleBackup} disabled={working} className="w-full">
              {working ? 'Erstelle Backup...' : 'Backup erstellen'}
            </Button>
          </TabsContent>
          <TabsContent value="restore" className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Stellt ein zuvor erstelltes Backup wieder her. Alle aktuellen Daten werden ersetzt.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => setRestoreFile(e.target.files?.[0] ?? null)}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => inputRef.current?.click()}
            >
              {restoreFile ? restoreFile.name : 'Backup-Datei auswählen...'}
            </Button>
            <Button
              onClick={handleRestore}
              disabled={!restoreFile || working}
              variant="destructive"
              className="w-full"
            >
              {working ? 'Stelle wieder her...' : 'Wiederherstellen'}
            </Button>
          </TabsContent>
        </Tabs>
        {status && (
          <p className={`text-sm ${status.startsWith('Fehler') ? 'text-destructive' : 'text-green-600'}`}>
            {status}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
