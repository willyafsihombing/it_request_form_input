export type StepCode = 'it_check' | 'it_manager' | 'supt_dept' | 'dept_manager' | 'sr_manager' | 'hoo';
export type StepStatus = 'waiting' | 'active' | 'approved' | 'rejected' | 'skipped';

export interface StepApprover { employeeId: string; nama: string; jabatan: string }

export interface ApprovalStep {
  id: string;
  code: StepCode;
  label: string;
  stepOrder: number;
  round: number;
  status: StepStatus;
  approvers: StepApprover[];
  actedByNama?: string;
  actedByJabatan?: string;
  actedAt?: string;
  note?: string;
  carriedOver: boolean;
}

export interface ApprovalProgressData {
  requestId: string;
  status: 'in_review' | 'approved' | 'rejected';
  round: number;
  currentStep: number;
  steps: ApprovalStep[];
  canAct: boolean;
}

export interface InboxItem {
  requestId: string;
  code: StepCode;
  label: string;
  stepOrder: number;
  round: number;
  submittedAt: string;
}

export interface ApprovalRoute {
  id: string;
  code: StepCode;
  label: string;
  departemen: string;
  approverEmployeeId: string;
  approverNama?: string;
  approverJabatan?: string;
  approverActive: boolean;
}

export interface Readiness {
  departemen: string;
  ready: boolean;
  problems: string[];
  steps: { code: StepCode; label: string; stepOrder: number; status: StepStatus; approvers: StepApprover[] }[];
}

export interface ActionResult {
  code: StepCode;
  decision: 'approved' | 'rejected';
  requestStatus: 'in_review' | 'approved' | 'rejected';
  currentStep: number;
  nextCode?: StepCode;
}
