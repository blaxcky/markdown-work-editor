import { useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/use-workspace-store';
import { buildTree, type TreeNode } from '@/lib/tree-utils';

export function useFileTree(): TreeNode[] {
  const files = useWorkspaceStore((s) => s.files);
  const folders = useWorkspaceStore((s) => s.folders);

  return useMemo(() => buildTree(files, folders), [files, folders]);
}
