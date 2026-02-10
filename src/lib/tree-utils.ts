import type { FileItem, FolderItem } from '@/db/types';

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string;
  order: number;
  isExpanded?: boolean;
  children?: TreeNode[];
  data: FileItem | FolderItem;
}

export function buildTree(files: FileItem[], folders: FolderItem[]): TreeNode[] {
  const folderNodes: TreeNode[] = folders.map((f) => ({
    id: f.id,
    name: f.name,
    type: 'folder' as const,
    parentId: f.parentId,
    order: f.order,
    isExpanded: f.isExpanded,
    children: [],
    data: f,
  }));

  const fileNodes: TreeNode[] = files.map((f) => ({
    id: f.id,
    name: f.name,
    type: 'file' as const,
    parentId: f.parentId,
    order: f.order,
    data: f,
  }));

  const nodeMap = new Map<string, TreeNode>();
  for (const node of folderNodes) {
    nodeMap.set(node.id, node);
  }

  const rootNodes: TreeNode[] = [];

  // Add folders to their parents
  for (const node of folderNodes) {
    if (node.parentId === '') {
      rootNodes.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent?.children) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  }

  // Add files to their parents
  for (const node of fileNodes) {
    if (node.parentId === '') {
      rootNodes.push(node);
    } else {
      const parent = nodeMap.get(node.parentId);
      if (parent?.children) {
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  }

  // Sort: folders first, then by order
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.order - b.order;
    });
    for (const node of nodes) {
      if (node.children) sortNodes(node.children);
    }
  };

  sortNodes(rootNodes);
  return rootNodes;
}
