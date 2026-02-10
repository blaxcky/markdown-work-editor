import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Einstellungen</DialogTitle>
          <DialogDescription>App-Einstellungen verwalten.</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Datenspeicherung</h4>
            <p className="text-xs text-muted-foreground">
              Alle Daten werden lokal in deinem Browser gespeichert (IndexedDB).
              Es werden keine Daten an Server gesendet.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Tastaturkürzel</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Sidebar ein/ausblenden</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Cmd+B</kbd>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Version</h4>
            <p className="text-xs text-muted-foreground">Markdown Work Editor v0.1.0</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
