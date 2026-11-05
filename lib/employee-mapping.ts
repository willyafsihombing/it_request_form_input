import type { EmployeeOption } from '@/lib/employee-api';

export function requesterFromEmployee(e: EmployeeOption) {
  return {
    reqName: e.nama,
  };
}

export function recipientFromEmployee(e: EmployeeOption) {
  return {
    recPersonnel: e.nama.toUpperCase(),
    recEmpId: e.nik,
    recTitle: (e.jabatan || '').toUpperCase(),
    recDept: e.departemen || '',
  };
}

export function clearedRecipient() {
  return {
    recPersonel: '',
    recEmpId:'',
    recTitle:'',
    recDept:'',
  }
}