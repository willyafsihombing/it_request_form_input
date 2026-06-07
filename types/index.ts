export interface ITRequest {
  id: string;
  formNumber: string;
  effectiveDate: string;

  reqCompany: string;
  reqName: string;

  recCompany: string;
  recDept: string;
  recLocation: string;
  recPersonnel: string;
  recEmpId: string;
  recTitle: string;
  recStatus: string;

  snAdd: boolean;
  snChange: boolean;
  snTerminate: boolean;
  snLAN: boolean;
  snVPN: boolean;
  snEmail: boolean;
  snFileSharing: boolean;
  snIntranet: boolean;
  snOther: string;

  hwAdd: boolean;
  hwChange: boolean;
  hwTerminate: boolean;
  hwPC: boolean;
  hwPrinter: boolean;
  hwNotebook: boolean;
  hwMSOffice: boolean;
  hwAdobe: boolean;
  hwZoom: boolean;
  hwOther: string;

  erpAdd: boolean;
  erpChange: boolean;
  erpTerminate: boolean;
  erpPronto: boolean;
  erpSmartMining: boolean;
  erpPositionId: string;
  erpDistrict: string;
  erpRef: string;
  erpSignOnId: string;
  erpGlobalProfile: string;

  additionalDesc: string;
  costCode: string;
  justification: string;
  techComment: string;
  techAD: boolean;
  techAW: boolean;
  techCR: boolean;
  techEM: boolean;
  techIP: boolean;
  techEP: boolean;

  sigRequester: string;
  sigSptDept: string;
  sigDeptMgr: string;
  sigSrMgr: string;
  sigHOO: string;
  sigITAdmin: string;
  sigMSDIMgr: string;

  status: RequestStatus;
  priority: RequestPriority;
  itNotes: string;
  assignedTo: string;

  createdAt: string | Date;
  updatedAt: string | Date;
}

export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
export type RequestPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface DashboardStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  rejected: number;
  thisMonth: number;
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};
