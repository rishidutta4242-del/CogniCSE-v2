import { DKMNode } from '../types';
import { CSE_DKM_NODES } from './dkmCse';
import { MECH_CAD_DKM_NODES } from './dkmMech';

export const INITIAL_DKM_NODES: DKMNode[] = [
  ...CSE_DKM_NODES,
  ...MECH_CAD_DKM_NODES,
];

export const INITIAL_ISLM_PROFILE = {
  student_id: 'CSE_STU_8810',
  name: 'Alex Chen',
  email: 'alex.chen@university.cse.edu',
  role: 'student' as const,
  course_track: 'Web Application Development',
  domain: 'cse' as const,
  overall_mastery: 0.62,
  topic_mastery: {
    HTML_CSS: 0.95,
    PHP_Syntax: 0.80,
    MySQL_Queries: 0.70,
    PDO_Connection: 0.25,
    Recursion_Base_Case: 0.30,
    Deadlock_Conditions: 0.28,
    Virtual_Memory: 0.45,
    TCP_Handshake: 0.88,
    cad_dof_2d: 0.20,
    cad_geometric_constraints: 0.20,
    cad_driving_parameters: 0.20,
    cad_extrude_operations: 0.20,
    cad_fillets_chamfers_g1: 0.20,
    cad_hub_bore_concentricity: 0.20,
    cad_material_mass_properties: 0.20,
    cad_stress_fos: 0.20,
  },
  recent_misconceptions: [
    'Confusing MySQL database port (3306) with HTTP web port (80)',
    'Omitting recursive base cases leading to call stack exhaustion',
    'Assuming global server variables provide isolated user session state',
    'Extruding an under-constrained (blue) sketch assuming it is finished (frequency 82%)',
  ],
  scaffolding_tier_required: 1,
  error_count: 8,
  independent_solves: 14,
  scaffolding_fading_index: 0.35,
  time_spent_mins: 142,
  history: [
    {
      id: 'h_1',
      timestamp: '2026-10-29 14:20',
      topic_id: 'pdo_mysql_port',
      topic_name: 'PHP PDO & MySQL Port Configuration',
      tier_used: 1,
      issue_type: 'PRACTICAL_EXECUTION_ERROR' as const,
      resolved_independently: false,
      notes: 'Student asked for direct fix code; Socratic deflection applied.',
    },
    {
      id: 'h_2',
      timestamp: '2026-10-29 16:45',
      topic_id: 'recursion_base_case',
      topic_name: 'Recursion Base Case & Stack Frames',
      tier_used: 2,
      issue_type: 'CONCEPTUAL_GAP' as const,
      resolved_independently: true,
      notes: 'Guided through base case termination condition; solved on second try.',
    },
    {
      id: 'h_3',
      timestamp: '2026-10-30 09:15',
      topic_id: 'tcp_three_way_handshake',
      topic_name: 'TCP 3-Way Handshake',
      tier_used: 1,
      issue_type: 'MISCONCEPTION' as const,
      resolved_independently: true,
      notes: 'Clarified SYN sequence numbers independently.',
    },
  ],
};
