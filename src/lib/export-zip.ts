import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FileItem, FolderItem } from '@/db/types';

export async function exportAsZip(
  files: FileItem[],
  folders: FolderItem[],
  rootFolderId: string = '',
  zipName: string = 'workspace'
) {
  const zip = new JSZip();

  const folderMap = new Map<string, FolderItem>();
  for (const f of folders) folderMap.set(f.id, f);

  function getFolderPath(folderId: string): string {
    if (folderId === '') return '';
    const folder = folderMap.get(folderId);
    if (!folder) return '';
    const parentPath = getFolderPath(folder.parentId);
    return parentPath ? `${parentPath}/${folder.name}` : folder.name;
  }

  const rootPath = rootFolderId ? getFolderPath(rootFolderId) : '';

  function toExportPath(absolutePath: string): string {
    if (!rootPath) return absolutePath;
    if (absolutePath === rootPath) return '';
    if (absolutePath.startsWith(`${rootPath}/`)) return absolutePath.slice(rootPath.length + 1);
    return absolutePath;
  }

  // Determine which folders are descendants of rootFolderId
  const includedFolderIds = new Set<string>();
  if (rootFolderId) {
    const collectDescendants = (id: string) => {
      includedFolderIds.add(id);
      folders.filter((f) => f.parentId === id).forEach((f) => collectDescendants(f.id));
    };
    collectDescendants(rootFolderId);
  }

  const filteredFiles = rootFolderId
    ? files.filter((f) => f.parentId === rootFolderId || includedFolderIds.has(f.parentId))
    : files;

  // Create folder structure
  for (const folder of folders) {
    if (rootFolderId && !includedFolderIds.has(folder.id)) continue;
    const path = toExportPath(getFolderPath(folder.id));
    if (path) zip.folder(path);
  }

  // Add files
  for (const file of filteredFiles) {
    const folderPath = toExportPath(getFolderPath(file.parentId));
    const filePath = folderPath ? `${folderPath}/${file.name}` : file.name;
    zip.file(filePath, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${zipName}.zip`);
}
