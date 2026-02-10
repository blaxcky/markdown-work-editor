# PWA Markdown Work Editor - Implementierungsplan

## Kontext

Erstellung einer vollständigen PWA-Markdown-Editor-App mit lokaler Datenspeicherung (IndexedDB), Ordner-/Dateiverwaltung, WYSIWYG-Editing, und Export/Import-Funktionen. Alle Daten bleiben auf dem Gerät - kein Server, kein Cloud-Speicher.

## Tech Stack

| Technologie | Zweck |
|---|---|
| **React 18 + Vite** | Framework + Build-Tool |
| **TypeScript** | Typsicherheit |
| **Milkdown (Crepe)** | WYSIWYG Markdown-Editor (ProseMirror-basiert) |
| **Tailwind CSS v4 + shadcn/ui** | UI-Design-System |
| **Dexie.js** | IndexedDB-Wrapper |
| **Zustand** | State Management |
| **vite-plugin-pwa** | PWA/Service Worker |
| **JSZip + file-saver** | ZIP Export/Import |
| **html2pdf.js + unified/remark (remark-gfm)** | PDF-Export (GFM-konsistent) |
| **@dnd-kit** | Drag & Drop im Dateibaum |
| **lucide-react** | Icons |
| **GitHub Pages + GitHub Actions** | Static Hosting + CI/CD Deployment |

---

## Projektstruktur

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── components/
│   ├── ui/                    # shadcn/ui Komponenten
│   ├── layout/
│   │   ├── AppLayout.tsx      # Hauptlayout (Sidebar + Editor)
│   │   ├── Sidebar.tsx
│   │   ├── SidebarHeader.tsx
│   │   └── SidebarFooter.tsx
│   ├── file-tree/
│   │   ├── FileTree.tsx       # Baum-Komponente
│   │   ├── TreeNode.tsx       # Rekursiver Knoten
│   │   ├── TreeNodeContextMenu.tsx
│   │   ├── CreateItemDialog.tsx
│   │   ├── RenameDialog.tsx
│   │   ├── MoveDialog.tsx
│   │   └── DeleteConfirmDialog.tsx
│   ├── editor/
│   │   ├── EditorArea.tsx     # Editor-Container
│   │   ├── EditorToolbar.tsx  # View-Toggle, Export-Buttons
│   │   ├── MilkdownEditor.tsx # WYSIWYG-Editor
│   │   ├── SourceEditor.tsx   # Quellcode-Ansicht
│   │   ├── EditorStatusBar.tsx
│   │   └── EmptyState.tsx
│   └── dialogs/
│       ├── ExportDialog.tsx
│       ├── ImportDialog.tsx
│       ├── BackupDialog.tsx
│       ├── PdfExportDialog.tsx
│       └── SettingsDialog.tsx
├── db/
│   ├── database.ts            # Dexie DB-Klasse
│   ├── file-operations.ts     # CRUD Dateien
│   ├── folder-operations.ts   # CRUD Ordner (rekursives Loeschen)
│   ├── settings-operations.ts
│   └── types.ts               # DB-Interfaces
├── stores/
│   ├── use-workspace-store.ts # Dateien, Ordner, aktive Datei
│   ├── use-editor-store.ts    # Editor-Modus, Dirty-State
│   └── use-ui-store.ts        # Sidebar, Dialoge
├── hooks/
│   ├── use-auto-save.ts       # Debounced Auto-Save (1s)
│   ├── use-file-tree.ts       # Flat -> Nested Tree-Transformation
│   └── use-keyboard-shortcuts.ts
├── lib/
│   ├── utils.ts               # shadcn cn() Utility
│   ├── export-zip.ts          # ZIP-Export (JSZip)
│   ├── import-zip.ts          # ZIP-Import
│   ├── export-pdf.ts          # PDF-Export (html2pdf.js)
│   ├── backup.ts              # Vollbackup/Restore
│   ├── tree-utils.ts          # Baum-Hilfsfunktionen
│   └── id.ts                  # crypto.randomUUID()
└── types/
    └── index.ts
```

---

## IndexedDB Schema (Dexie.js)

```typescript
// files: id, name, content, parentId, createdAt, updatedAt, order
// folders: id, name, parentId, createdAt, updatedAt, order, isExpanded
// settings: key, value

this.version(1).stores({
  files: 'id, parentId, name, updatedAt, order',
  folders: 'id, parentId, name, order',
  settings: 'key',
});
```

- `parentId: null` -> Root-Ebene (intern als `""` gespeichert fuer Index-Kompatibilitaet)
- `order: number` -> Sortierung innerhalb eines Ordners
- `content` wird bewusst NICHT indexiert (kann gross sein)

---

## Implementierungs-Phasen

### Phase 1: Projekt-Setup & Foundation

1. `npm create vite@latest . -- --template react-ts`
2. Tailwind CSS v4 installieren (`tailwindcss`, `@tailwindcss/vite`, `@tailwindcss/typography`)
3. shadcn/ui initialisieren (`npx shadcn@latest init`) + Basis-Komponenten installieren
4. `vite-plugin-pwa` konfigurieren (Manifest, Service Worker, Icons)
5. Alle Abhaengigkeiten installieren (dexie, zustand, milkdown, jszip, etc.)
6. Basis-Layout erstellen: `AppLayout.tsx` mit Sidebar (280px) + Editor-Bereich
7. `.gitignore` erstellen, PWA-Icons in `public/`
8. GitHub Pages Deployment vorbereiten:
   - Vite `base` korrekt setzen (Repo-Name / Unterpfad)
   - GitHub Actions Workflow: Build -> Deploy zu Pages

**Ergebnis:** Laufender Dev-Server, installierbares PWA-Grundgeruest, Zwei-Panel-Layout

### Phase 2: IndexedDB & Daten-Layer

1. `src/db/types.ts` - TypeScript-Interfaces fuer FileItem, FolderItem, Setting
2. `src/db/database.ts` - Dexie-Datenbankklasse mit Schema
3. `src/db/file-operations.ts` - CRUD fuer Dateien
4. `src/db/folder-operations.ts` - CRUD fuer Ordner (inkl. rekursives Loeschen)
5. `src/db/settings-operations.ts` - Key-Value-Settings
6. `src/stores/use-workspace-store.ts` - Zustand-Store, jede Mutation schreibt erst in IndexedDB, dann State-Update
7. `src/stores/use-editor-store.ts` - Editor-Modus, Dirty-State, Wort-/Zeichenzaehler
8. `src/stores/use-ui-store.ts` - Sidebar-Toggle
9. `src/hooks/use-file-tree.ts` - Flat-Arrays -> verschachtelte Baumstruktur (memoized)
10. `src/hooks/use-auto-save.ts` - Debounced Auto-Save mit Flush bei Datei-/Moduswechsel

**Ergebnis:** Vollstaendiger Daten-Layer mit reaktiven Stores

### Phase 3: Datei-/Ordner-Sidebar

1. `SidebarHeader.tsx` - Logo, "Neue Datei"/"Neuer Ordner"-Buttons
2. `FileTree.tsx` - Baum-Rendering mit DndContext
3. `TreeNode.tsx` - Rekursiv, Einrueckung per Tiefe, Icons (Folder/File), Klick-Handler
4. `TreeNodeContextMenu.tsx` - Rechtsklick-Menue (Erstellen, Umbenennen, Loeschen, Verschieben, Export)
5. `CreateItemDialog.tsx`, `RenameDialog.tsx`, `DeleteConfirmDialog.tsx`, `MoveDialog.tsx`
6. Drag & Drop mit @dnd-kit (Sortierung + Verschieben in Ordner)
7. `SidebarFooter.tsx` - Backup/Import/Settings-Buttons

**Ergebnis:** Vollstaendiger Dateibaum mit allen CRUD-Operationen und Drag & Drop

### Phase 4: Milkdown Editor

1. `EditorArea.tsx` - Container, zeigt EmptyState oder Editor je nach Auswahl
2. `MilkdownEditor.tsx` - Milkdown Crepe Integration:
   - Features: CodeMirror, ListItem, LinkTooltip, BlockEdit, Table, Toolbar, Cursor, Placeholder
   - `markdownUpdated`-Listener fuer onChange
   - `key={fileId}` fuer Re-Mount bei Dateiwechsel
3. `SourceEditor.tsx` - Plain `<textarea>` mit Monospace-Font (v1)
4. `EditorToolbar.tsx` - Dateiname-Anzeige, WYSIWYG/Source-Toggle, Export-Dropdown
5. `EditorStatusBar.tsx` - Wortzahl, Zeichenzahl, Speicherstatus, Zeitstempel
6. Auto-Save Integration: `useAutoSave` Hook in EditorArea
7. Modus-Wechsel: Auto-Save flushen -> Store aktualisieren -> neuen Editor mounten

**Kritisch:** Bei Moduswechsel (WYSIWYG <-> Source) immer erst speichern, dann neuen Editor mit aktuellem Content laden.

**Ergebnis:** Voll funktionaler WYSIWYG-Editor mit Source-Toggle und Auto-Save

### Phase 5: Export/Import (ZIP)

1. `src/lib/export-zip.ts` - Rekursive Ordnerstruktur in ZIP schreiben (JSZip)
2. `src/lib/import-zip.ts` - ZIP lesen, Ordner/Dateien in IndexedDB erstellen (in Dexie-Transaktion)
3. `src/lib/backup.ts` - Vollbackup: JSON-Daten (`_data/files.json`, `_data/folders.json`, `_data/settings.json`) + lesbare Markdown-Ordnerstruktur im selben ZIP
4. Restore: Validierung (`_backup_metadata.json`), bestehende Daten loeschen, aus JSON wiederherstellen
5. `ExportDialog.tsx` - Scope-Auswahl (ganzer Workspace oder Ordner)
6. `ImportDialog.tsx` - Dateiauswahl, Zielordner, Import
7. `BackupDialog.tsx` - Zwei Tabs: "Backup erstellen" / "Backup wiederherstellen"

**Design-Entscheidung:** Backup enthält sowohl JSON-Rohdaten (fuer perfekte Wiederherstellung inkl. IDs, Order, Timestamps) als auch lesbare Markdown-Dateien (falls man die Daten ohne App benoetigt).

**Ergebnis:** Komplettes Export/Import/Backup-System

### Phase 6: PDF-Export

1. GFM-faehige Markdown->HTML Pipeline installieren (konsistent zum Editor): `unified`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-stringify`
2. `src/lib/export-pdf.ts` - Markdown (GFM) -> HTML (unified/remark) -> html2pdf.js -> PDF-Download
3. Einzeldatei-Export: Eine PDF pro Datei
4. Ordner-Export: Kombiniertes PDF mit Seitenumbruechen zwischen Dateien
5. `PdfExportDialog.tsx` - Scope, Seitengroesse (A4/Letter), Ausrichtung

**Ergebnis:** PDF-Export fuer Dateien und Ordner

---

## Wichtige Design-Entscheidungen

- **Bilder:** Base64-Inline-Encoding (einfachste Loesung fuer lokale PWA, kein Server noetig)
- **Offline:** Automatisch durch PWA + IndexedDB - alle Assets pre-cached, alle Daten lokal
- **Performance:** `React.memo` auf TreeNode, debounced Auto-Save, Milkdown Re-Mount per `key`-Prop
- **Datensicherheit:** Alle Daten nur in IndexedDB, kein Netzwerk-Request, kein Analytics

## Deployment: GitHub Pages

- **Hosting:** GitHub Pages (statisches Hosting reicht, da App komplett clientseitig arbeitet)
- **Wichtig:** Bei GitHub Pages unter einem Unterpfad muss Vite `base` und das PWA-Manifest (`start_url`/`scope`) dazu passen, damit Service Worker/Assets korrekt funktionieren.
- **CI/CD:** GitHub Actions Workflow, der `npm ci`/Build ausfuehrt und das `dist/` Artefakt nach Pages deployt.
- **Optional (Empfehlung):** Custom Domain verwenden, um spaeter ohne Unterpfad zu deployen (vereinfacht `base`/PWA-Scope).

## Verifizierung

1. `npm run dev` -> App startet, Layout sichtbar
2. Dateien/Ordner erstellen, umbenennen, loeschen, verschieben -> funktioniert in Sidebar
3. Markdown schreiben im WYSIWYG-Modus -> Formatierung sichtbar
4. Auf Source-Modus umschalten -> Roher Markdown sichtbar, Aenderungen werden uebernommen
5. Browser schliessen und oeffnen -> Alle Daten erhalten (IndexedDB)
6. ZIP-Export -> Korrekte Ordnerstruktur mit .md-Dateien
7. ZIP-Import -> Dateien erscheinen im Workspace
8. Backup erstellen + Restore -> Alle Daten wiederhergestellt
9. PDF-Export -> Sauberes PDF mit korrekter Formatierung
10. PWA installieren (Chrome > "App installieren") -> Funktioniert offline
11. Deployment auf GitHub Pages -> App laedt korrekt unter Pages-URL (inkl. PWA Assets/Service Worker)
