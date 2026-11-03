import { DKMNode } from '../types';
import { CSE_APP_NODES } from './dkmCseApp';
import { CSE_SYS_NODES } from './dkmCseSys';

export const CSE_DKM_NODES: DKMNode[] = [...CSE_APP_NODES, ...CSE_SYS_NODES];
