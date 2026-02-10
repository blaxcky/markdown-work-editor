export interface FileItem {
  id: string;
  name: string;
  content: string;
  parentId: string; // "" for root
  createdAt: number;
  updatedAt: number;
  order: number;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string; // "" for root
  createdAt: number;
  updatedAt: number;
  order: number;
  isExpanded: boolean;
}

export interface Setting {
  key: string;
  value: string;
}
