
export interface Language {
  id: string;
  name: string;
  extension: string;
}

export interface FileNode {
  name: string;
  path: string;
  content?: string;
  children: FileNode[];
  isFolder: boolean;
}

export interface ConvertedFile {
  path: string;
  content: string;
}
