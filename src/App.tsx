import { TooltipProvider } from '@/components/ui/tooltip';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExportDialog } from '@/components/dialogs/ExportDialog';
import { ImportDialog } from '@/components/dialogs/ImportDialog';
import { BackupDialog } from '@/components/dialogs/BackupDialog';
import { PdfExportDialog } from '@/components/dialogs/PdfExportDialog';
import { SettingsDialog } from '@/components/dialogs/SettingsDialog';
import { useUIStore } from '@/stores/use-ui-store';

export default function App() {
  const activeDialog = useUIStore((s) => s.activeDialog);
  const closeDialog = useUIStore((s) => s.closeDialog);

  return (
    <TooltipProvider>
      <AppLayout />
      <ExportDialog open={activeDialog === 'export'} onOpenChange={(open) => !open && closeDialog()} />
      <ImportDialog open={activeDialog === 'import'} onOpenChange={(open) => !open && closeDialog()} />
      <BackupDialog open={activeDialog === 'backup'} onOpenChange={(open) => !open && closeDialog()} />
      <PdfExportDialog open={activeDialog === 'pdfExport'} onOpenChange={(open) => !open && closeDialog()} />
      <SettingsDialog open={activeDialog === 'settings'} onOpenChange={(open) => !open && closeDialog()} />
    </TooltipProvider>
  );
}
