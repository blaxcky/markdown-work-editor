import { create } from 'zustand';

export type DialogType = 'export' | 'import' | 'backup' | 'settings' | 'pdfExport' | null;

interface UIState {
  sidebarOpen: boolean;
  activeDialog: DialogType;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openDialog: (dialog: NonNullable<DialogType>) => void;
  closeDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeDialog: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  openDialog: (activeDialog) => set({ activeDialog }),
  closeDialog: () => set({ activeDialog: null }),
}));
