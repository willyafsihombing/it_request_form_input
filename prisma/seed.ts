import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleData = [
  {
    formNumber: '174-ITR-Unggul062026',
    effectiveDate: '6/5/2026',
    reqCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    reqName: 'SURYA SAPUTRA PURNOMO',
    recCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    recDept: 'GA',
    recLocation: 'SITE INDEXIM - KALIORANG',
    recPersonnel: 'FERRI MULIANTO',
    recEmpId: '51122646',
    recTitle: 'ACT.SUPT GA',
    recStatus: 'KARYAWAN',
    hwAdd: true,
    hwPC: true,
    hwNotebook: true,
    hwOther: 'LAPTOP',
    additionalDesc:
      '2X DESKTOP LENOVO THINKCENTRE NEO 5 RAM 16GB SSD 1TB + MONITOR 24 INCH\n1X LAPTOP LENOVO LEGION 5 CORE i7 SSD 1TB RAM 16GB NVDIA RTX4060\n2X WINDOWS 11 PROFESIONAL\n2X OFFICE LTSC 2024 STANDARD\n2X MOUSE BLUETOOTH M196 LOGITECH',
    justification: 'KEBUTUHAN LAPTOP DAN DESKTOP PENAMBAHAN BUDGET ALOKASI\nUNTUK ADMIN DAN FOREMAN CAMP&SERVICE',
    sigRequester: 'SURYA SAPUTRA PURNOMO',
    sigSptDept: 'FERRI MULIANTO',
    sigDeptMgr: "SYAHIRUL ALI'M",
    sigHOO: 'M SYAH IRAN',
    sigITAdmin: 'HENDRIK ADELMEI',
    sigMSDIMgr: 'ADE WAHYUDIN',
    status: 'pending',
    priority: 'high',
  },
  {
    formNumber: '175-ITR-Unggul062026',
    effectiveDate: '6/3/2026',
    reqCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    reqName: 'AHMAD FARHAN',
    recCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    recDept: 'IT',
    recLocation: 'HEAD OFFICE - JAKARTA',
    recPersonnel: 'DONI PRATAMA',
    recEmpId: '51098321',
    recTitle: 'IT SUPPORT',
    recStatus: 'KARYAWAN',
    snAdd: true,
    snLAN: true,
    snVPN: true,
    additionalDesc: 'SETUP JARINGAN BARU UNTUK RUANG SERVER',
    justification: 'PENINGKATAN KAPASITAS JARINGAN UNTUK KEBUTUHAN OPERASIONAL',
    sigRequester: 'AHMAD FARHAN',
    sigSptDept: 'DONI PRATAMA',
    status: 'in_review',
    priority: 'normal',
    assignedTo: 'HENDRIK ADELMEI',
  },
  {
    formNumber: '173-ITR-Unggul052026',
    effectiveDate: '5/20/2026',
    reqCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    reqName: 'BUDI SANTOSO',
    recCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    recDept: 'FINANCE',
    recLocation: 'HEAD OFFICE - JAKARTA',
    recPersonnel: 'SITI RAHAYU',
    recEmpId: '51077654',
    recTitle: 'FINANCE STAFF',
    recStatus: 'KARYAWAN',
    hwAdd: true,
    hwMSOffice: true,
    hwAdobe: true,
    additionalDesc: '2X MICROSOFT OFFICE 365 LICENSE\n1X ADOBE ACROBAT PRO',
    justification: 'LISENSI SOFTWARE UNTUK KEBUTUHAN OPERASIONAL FINANCE',
    sigRequester: 'BUDI SANTOSO',
    sigSptDept: 'SITI RAHAYU',
    status: 'approved',
    priority: 'low',
    itNotes: 'Lisensi sudah disetujui dan akan diaktivasi minggu depan',
    assignedTo: 'HENDRIK ADELMEI',
  },
  {
    formNumber: '172-ITR-Unggul052026',
    effectiveDate: '5/10/2026',
    reqCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    reqName: 'RINI WULANDARI',
    recCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    recDept: 'HR',
    recLocation: 'HEAD OFFICE - JAKARTA',
    recPersonnel: 'AGUS PRAYITNO',
    recEmpId: '51065432',
    recTitle: 'HR MANAGER',
    recStatus: 'KARYAWAN',
    erpAdd: true,
    erpPronto: true,
    erpPositionId: 'HRM001',
    additionalDesc: 'AKSES ERP PRONTO UNTUK HR MANAGER BARU',
    justification: 'ONBOARDING HR MANAGER BARU MEMBUTUHKAN AKSES SISTEM ERP',
    sigRequester: 'RINI WULANDARI',
    status: 'rejected',
    priority: 'normal',
    itNotes: 'Ditolak karena quota license ERP sudah penuh. Akan ditindaklanjuti Q3 2026.',
  },
  {
    formNumber: '176-ITR-Unggul062026',
    effectiveDate: '6/5/2026',
    reqCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    reqName: 'TOMMY WIJAYA',
    recCompany: 'PT. UNGGUL DINAMIKA UTAMA',
    recDept: 'ENGINEERING',
    recLocation: 'SITE MUARA BADAK',
    recPersonnel: 'HENDRA KUSUMA',
    recEmpId: '51133901',
    recTitle: 'SENIOR ENGINEER',
    recStatus: 'KARYAWAN',
    hwAdd: true,
    hwNotebook: true,
    hwOther: 'DOCKING STATION + EXTERNAL MONITOR',
    additionalDesc: '1X LENOVO THINKPAD X1 CARBON\n1X DELL DOCKING STATION\n1X LG 27" 4K MONITOR',
    justification: 'PENGGANTIAN LAPTOP LAMA YANG SUDAH TIDAK LAYAK PAKAI',
    sigRequester: 'TOMMY WIJAYA',
    status: 'pending',
    priority: 'urgent',
  },

  
];

async function main() {
  console.log('Seeding database...');

  for (const data of sampleData) {
    await prisma.request.upsert({
      where: { formNumber: data.formNumber },
      update: {},
      create: data,
    });
  }

  console.log(`Seeded ${sampleData.length} records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
