import React from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { TreeNodeContextMenu } from './TreeNodeContextMenu';
import type { TreeNode as TreeNodeType } from '@/lib/tree-utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TreeNodeProps {
  node: TreeNodeType;
  depth: number;
}

export const TreeNode = React.memo(function TreeNode({ node, depth }: TreeNodeProps) {
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const setActiveFile = useWorkspaceStore((s) => s.setActiveFile);
  const toggleFolderExpanded = useWorkspaceStore((s) => s.toggleFolderExpanded);

  const isActive = node.type === 'file' && node.id === activeFileId;
  const isFolder = node.type === 'folder';
  const isExpanded = node.isExpanded;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    data: { type: node.type, parentId: node.parentId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    if (isFolder) {
      toggleFolderExpanded(node.id);
    } else {
      setActiveFile(node.id);
    }
  };

  return (
    <TreeNodeContextMenu node={node}>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <div
          className={cn(
            'flex items-center gap-1 px-2 py-1 cursor-pointer text-sm hover:bg-sidebar-accent rounded-sm mx-1',
            isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
            isDragging && 'opacity-50'
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={handleClick}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </>
          ) : (
            <>
              <span className="w-3.5" />
              <File className="h-4 w-4 shrink-0 text-muted-foreground" />
            </>
          )}
          <span className="truncate">{node.name}</span>
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </TreeNodeContextMenu>
  );
});
