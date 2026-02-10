import { useState, type ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { FilePlus, FolderPlus, Pencil, Trash2, Move, FileDown } from 'lucide-react';
import type { TreeNode } from '@/lib/tree-utils';
import { CreateItemDialog } from './CreateItemDialog';
import { RenameDialog } from './RenameDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { MoveDialog } from './MoveDialog';
import { useWorkspaceStore } from '@/stores/use-workspace-store';

interface Props {
  node: TreeNode;
  children: ReactNode;
}

export function TreeNodeContextMenu({ node, children }: Props) {
  const [showCreate, setShowCreate] = useState<'file' | 'folder' | null>(null);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);

  const isFolder = node.type === 'folder';
  const createFile = useWorkspaceStore((s) => s.createFile);
  const createFolder = useWorkspaceStore((s) => s.createFolder);

  const parentIdForCreate = isFolder ? node.id : node.parentId;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem onClick={() => setShowCreate('file')}>
            <FilePlus className="h-4 w-4 mr-2" />
            Neue Datei
          </ContextMenuItem>
          {isFolder && (
            <ContextMenuItem onClick={() => setShowCreate('folder')}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Neuer Ordner
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setShowRename(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Umbenennen
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowMove(true)}>
            <Move className="h-4 w-4 mr-2" />
            Verschieben
          </ContextMenuItem>
          {!isFolder && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => {
                const file = node.data as { content: string; name: string };
                const blob = new Blob([file.content], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = node.name;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                <FileDown className="h-4 w-4 mr-2" />
                Herunterladen
              </ContextMenuItem>
            </>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Löschen
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <CreateItemDialog
        open={showCreate !== null}
        onOpenChange={(open) => !open && setShowCreate(null)}
        type={showCreate ?? 'file'}
        onCreate={(name) => {
          if (showCreate === 'file') {
            createFile(name, '', parentIdForCreate);
          } else {
            createFolder(name, parentIdForCreate);
          }
          setShowCreate(null);
        }}
      />

      <RenameDialog
        open={showRename}
        onOpenChange={setShowRename}
        node={node}
      />

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        node={node}
      />

      <MoveDialog
        open={showMove}
        onOpenChange={setShowMove}
        node={node}
      />
    </>
  );
}
