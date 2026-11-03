import { VirtualFile, VirtualDirectory, VirtualNode } from './types';

export const DOCROOT_PATH = 'C:\\xampp\\htdocs';
export const DESKTOP_PATH = 'C:\\Users\\Student\\Desktop';
export const DOCUMENTS_PATH = 'C:\\Users\\Student\\Documents';

export function normalizeVirtualPath(pathStr: string): string {
  if (!pathStr) return 'C:\\xampp\\htdocs';
  let cleaned = pathStr.replace(/\//g, '\\').trim();
  // Strip trailing backslash unless root C:\
  if (cleaned.length > 3 && cleaned.endsWith('\\')) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

export function createInitialFileSystem(): VirtualDirectory {
  const root: VirtualDirectory = {
    name: 'C:',
    path: 'C:',
    isDirectory: true,
    children: {},
  };

  const users: VirtualDirectory = {
    name: 'Users',
    path: 'C:\\Users',
    isDirectory: true,
    children: {},
  };

  const student: VirtualDirectory = {
    name: 'Student',
    path: 'C:\\Users\\Student',
    isDirectory: true,
    children: {},
  };

  const desktop: VirtualDirectory = {
    name: 'Desktop',
    path: 'C:\\Users\\Student\\Desktop',
    isDirectory: true,
    children: {
      'notes.txt': {
        name: 'notes.txt',
        path: 'C:\\Users\\Student\\Desktop\\notes.txt',
        content: 'TODO: Complete CSE Web Dev Lab by Friday.\nRemember: Apache server runs on port 80.',
        isDirectory: false,
        updatedAt: new Date().toISOString(),
      },
    },
  };

  const documents: VirtualDirectory = {
    name: 'Documents',
    path: 'C:\\Users\\Student\\Documents',
    isDirectory: true,
    children: {},
  };

  student.children['Desktop'] = desktop;
  student.children['Documents'] = documents;
  users.children['Student'] = student;

  const xampp: VirtualDirectory = {
    name: 'xampp',
    path: 'C:\\xampp',
    isDirectory: true,
    children: {},
  };

  const htdocs: VirtualDirectory = {
    name: 'htdocs',
    path: 'C:\\xampp\\htdocs',
    isDirectory: true,
    children: {
      'welcome.html': {
        name: 'welcome.html',
        path: 'C:\\xampp\\htdocs\\welcome.html',
        content: '<!DOCTYPE html>\n<html>\n<head><title>XAMPP Apache</title></head>\n<body>\n  <h1>Apache / 2.4.54 (Win64)</h1>\n  <p>DocumentRoot: C:\\xampp\\htdocs</p>\n</body>\n</html>',
        isDirectory: false,
        updatedAt: new Date().toISOString(),
      },
    },
  };

  const apache: VirtualDirectory = {
    name: 'apache',
    path: 'C:\\xampp\\apache',
    isDirectory: true,
    children: {
      'conf': {
        name: 'conf',
        path: 'C:\\xampp\\apache\\conf',
        isDirectory: true,
        children: {
          'httpd.conf': {
            name: 'httpd.conf',
            path: 'C:\\xampp\\apache\\conf\\httpd.conf',
            content: '# Apache 2.4 configuration\nListen 80\nServerName localhost:80\nDocumentRoot "C:/xampp/htdocs"\n<Directory "C:/xampp/htdocs">\n    Options Indexes FollowSymLinks\n    AllowOverride All\n    Require all granted\n</Directory>',
            isDirectory: false,
            updatedAt: new Date().toISOString(),
          },
        },
      },
    },
  };

  xampp.children['htdocs'] = htdocs;
  xampp.children['apache'] = apache;

  root.children['Users'] = users;
  root.children['xampp'] = xampp;

  return root;
}

export function findNodeByPath(root: VirtualDirectory, targetPath: string): VirtualNode | null {
  const norm = normalizeVirtualPath(targetPath);
  if (norm === 'C:' || norm === 'C:\\') return root;

  // Split components after C:
  const withoutDrive = norm.replace(/^C:\\?/i, '');
  if (!withoutDrive) return root;

  const segments = withoutDrive.split('\\').filter(Boolean);
  let current: VirtualNode = root;

  for (const seg of segments) {
    if (!current.isDirectory) return null;
    const matchKey: string | undefined = Object.keys(current.children).find(
      k => k.toLowerCase() === seg.toLowerCase()
    );
    if (!matchKey) return null;
    current = current.children[matchKey];
  }

  return current;
}

export function getDirectoryEntries(root: VirtualDirectory, dirPath: string): VirtualNode[] {
  const node = findNodeByPath(root, dirPath);
  if (!node || !node.isDirectory) return [];
  return Object.values(node.children);
}

export function writeVirtualFile(
  root: VirtualDirectory,
  fullPath: string,
  content: string
): { success: boolean; file?: VirtualFile; error?: string } {
  const norm = normalizeVirtualPath(fullPath);
  const lastSlash = norm.lastIndexOf('\\');
  if (lastSlash === -1) {
    return { success: false, error: 'Invalid path: must include drive and directory' };
  }

  const dirPath = norm.substring(0, lastSlash);
  const fileName = norm.substring(lastSlash + 1);

  if (!fileName) {
    return { success: false, error: 'Filename cannot be empty' };
  }

  const dirNode = findNodeByPath(root, dirPath);
  if (!dirNode || !dirNode.isDirectory) {
    return { success: false, error: `Directory not found: ${dirPath}` };
  }

  const newFile: VirtualFile = {
    name: fileName,
    path: norm,
    content,
    isDirectory: false,
    updatedAt: new Date().toISOString(),
  };

  dirNode.children[fileName] = newFile;
  return { success: true, file: newFile };
}

export function makeVirtualDirectory(
  root: VirtualDirectory,
  fullPath: string
): { success: boolean; error?: string } {
  const norm = normalizeVirtualPath(fullPath);
  const lastSlash = norm.lastIndexOf('\\');
  if (lastSlash === -1) return { success: false, error: 'Invalid path' };

  const parentPath = norm.substring(0, lastSlash);
  const dirName = norm.substring(lastSlash + 1);

  const parent = findNodeByPath(root, parentPath);
  if (!parent || !parent.isDirectory) {
    return { success: false, error: `Parent directory not found: ${parentPath}` };
  }

  if (parent.children[dirName]) {
    return { success: false, error: `Directory or file already exists: ${dirName}` };
  }

  parent.children[dirName] = {
    name: dirName,
    path: norm,
    isDirectory: true,
    children: {},
  };

  return { success: true };
}
