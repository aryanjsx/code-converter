
import React, { useState } from 'react';
import { truncatePath } from '../utils/pathSanitizer';
import type { FileNode } from '../types';

const FolderIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-indigo-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);

const FileIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-indigo-300 transition-colors"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
);


interface FileTreeProps {
  node: FileNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  level?: number;
}

const FileTreeNode: React.FC<FileTreeProps> = ({ node, selectedFile, onSelectFile, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(true);
  const paddingLeft = `${level * 12 + 8}px`;

  if (node.isFolder) {
    return (
      <div>
        <div
          className="flex items-center gap-2 cursor-pointer py-1.5 pr-2 hover:bg-white/5 transition-colors rounded-md mx-1"
          style={{ paddingLeft }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <FolderIcon isOpen={isOpen} />
          <span className="font-medium text-gray-300 text-sm truncate" title={node.name}>{truncatePath(node.name)}</span>
        </div>
        {isOpen && (
          <div className="border-l border-white/5 ml-3">
            {node.children.map(child => (
              <FileTreeNode key={child.path} node={child} selectedFile={selectedFile} onSelectFile={onSelectFile} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer py-1.5 pr-2 mx-1 rounded-md group transition-all ${selectedFile === node.path ? 'bg-indigo-500/20 text-indigo-200' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'}`}
      style={{ paddingLeft }}
      onClick={() => onSelectFile(node.path)}
    >
      <FileIcon />
      <span className="text-sm truncate" title={node.name}>{truncatePath(node.name)}</span>
    </div>
  );
};


const FileTree: React.FC<{ fileTree: FileNode | null, selectedFile: string | null, onSelectFile: (path: string) => void, title: string }> = ({ fileTree, selectedFile, onSelectFile, title }) => {
  if (!fileTree) {
    return (
      <div className="p-6 text-center h-full flex flex-col items-center justify-center opacity-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 mb-2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>
        <p className="text-gray-500 text-sm">No files uploaded</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-4 pt-4">{title}</h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-2">
        {fileTree.children.map(node => (
          <FileTreeNode key={node.path} node={node} selectedFile={selectedFile} onSelectFile={onSelectFile} />
        ))}
      </div>
    </div>
  );
};

export default FileTree;
