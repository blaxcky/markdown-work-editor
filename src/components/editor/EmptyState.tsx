import { FileText } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
      <FileText className="h-16 w-16 opacity-20" />
      <div className="text-center">
        <p className="text-lg font-medium">Keine Datei ausgewählt</p>
        <p className="text-sm mt-1">Wähle eine Datei aus der Sidebar oder erstelle eine neue.</p>
      </div>
    </div>
  );
}
