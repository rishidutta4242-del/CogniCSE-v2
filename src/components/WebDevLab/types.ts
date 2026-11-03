export type WebLabErrorCategory =
  | 'file_management'
  | 'directory_error'
  | 'server_config'
  | 'db_connection'
  | 'sql_query'
  | 'syntax';

export interface VirtualFile {
  name: string;
  path: string; // e.g. "C:\\xampp\\htdocs\\index.html"
  content: string;
  isDirectory: false;
  updatedAt: string;
}

export interface VirtualDirectory {
  name: string;
  path: string; // e.g. "C:\\xampp\\htdocs"
  isDirectory: true;
  children: Record<string, VirtualFile | VirtualDirectory>;
}

export type VirtualNode = VirtualFile | VirtualDirectory;

export interface MySQLStudent {
  id: number;
  name: string;
  email: string;
  major: string;
  gpa: number;
}

export interface MySQLCourse {
  id: number;
  code: string;
  title: string;
  credits: number;
  department: string;
}

export interface VirtualMySQLDatabase {
  students: MySQLStudent[];
  courses: MySQLCourse[];
}

export interface ProactiveNudge {
  id: string;
  tier: number;
  title: string;
  message: string;
  socraticQuestion: string;
  errorCategory: WebLabErrorCategory;
  timestamp: string;
  refusalReason?: string;
}

export interface LabExercise {
  id: 'docroot_index' | 'pdo_connection' | 'prepared_select';
  conceptId: string;
  conceptName: string;
  title: string;
  tier: number;
  summary: string;
  instruction: string;
  recommendedFile: string;
  recommendedDir: string;
  starterCode: string;
  expectedUrl: string;
  hints: string[];
}
