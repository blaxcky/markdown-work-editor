import { useEffect } from 'react';
import { useFileTree } from '@/hooks/use-file-tree';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { TreeNode } from './TreeNode';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

export function FileTree() {
  const tree = useFileTree();
  const loadWorkspace = useWorkspaceStore((s) => s.loadWorkspace);
  const updateFile = useWorkspaceStore((s) => s.updateFile);
  const updateFolder = useWorkspaceStore((s) => s.updateFolder);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const flatIds = flattenIds(tree);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current as { type: string; parentId: string } | undefined;
    const overData = over.data.current as { type: string; parentId: string } | undefined;
    if (!activeData || !overData) return;

    // Move into folder if dropping on a folder
    if (overData.type === 'folder' && activeData.type === 'file') {
      const overId = over.id as string;
      if (activeData.parentId !== overId) {
        updateFile(active.id as string, { parentId: overId, order: 0 });
      }
      return;
    }

    // Reorder within same parent
    if (activeData.parentId === overData.parentId) {
      // Simple reorder: swap orders
      const store = useWorkspaceStore.getState();
      const parentId = activeData.parentId;
      const allItems = [
        ...store.folders.filter((f) => f.parentId === parentId).map((f) => ({ id: f.id, type: 'folder' as const, order: f.order })),
        ...store.files.filter((f) => f.parentId === parentId).map((f) => ({ id: f.id, type: 'file' as const, order: f.order })),
      ].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.order - b.order;
      });

      const oldIndex = allItems.findIndex((i) => i.id === active.id);
      const newIndex = allItems.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const [moved] = allItems.splice(oldIndex, 1);
      allItems.splice(newIndex, 0, moved);

      allItems.forEach((item, idx) => {
        if (item.type === 'folder') {
          updateFolder(item.id, { order: idx });
        } else {
          updateFile(item.id, { order: idx });
        }
      });
    }
  }

  return (
    <div className="py-1">
      {tree.length === 0 ? (
        <div className="px-3 py-8 text-center text-xs text-muted-foreground">
          Noch keine Dateien vorhanden.
          <br />
          Erstelle eine neue Datei oder importiere vorhandene.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
            {tree.map((node) => (
              <TreeNode key={node.id} node={node} depth={0} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function flattenIds(nodes: ReturnType<typeof useFileTree>): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    ids.push(node.id);
    if (node.children && node.isExpanded) {
      ids.push(...flattenIds(node.children));
    }
  }
  return ids;
}
