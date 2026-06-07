import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateFormNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status    = searchParams.get('status');
    const priority  = searchParams.get('priority');
    const search    = searchParams.get('search');
    const page      = parseInt(searchParams.get('page') || '1');
    const limit     = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && status !== 'all')   where.status   = status;
    if (priority && priority !== 'all') where.priority = priority;
    if (search) {
      where.OR = [
        { formNumber:   { contains: search } },
        { reqName:      { contains: search } },
        { recPersonnel: { contains: search } },
        { recDept:      { contains: search } },
        { recLocation:  { contains: search } },
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.request.count({ where }),
      prisma.request.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, formNumber: true, effectiveDate: true,
          reqName: true, recDept: true, recLocation: true,
          recPersonnel: true, recEmpId: true,
          hwAdd: true, hwChange: true, hwTerminate: true,
          snAdd: true, snChange: true, snTerminate: true,
          erpAdd: true, erpChange: true, erpTerminate: true,
          hwPC: true, hwPrinter: true, hwNotebook: true, hwOther: true,
          additionalDesc: true,
          status: true, priority: true, assignedTo: true,
          createdAt: true, updatedAt: true, 
        },
      }),
    ]);

    return NextResponse.json({ requests, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('GET /api/requests:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const formNumber = body.formNumber || generateFormNumber();

    // Check for duplicate form number
    const existing = await prisma.request.findUnique({ where: { formNumber } });
    if (existing) {
      return NextResponse.json({ error: 'Form number already exists' }, { status: 409 });
    }

    const newRequest = await prisma.request.create({
      data: {
        formNumber,
        effectiveDate:  body.effectiveDate  || new Date().toLocaleDateString('en-US'),
        reqCompany:     body.reqCompany     || '',
        reqName:        body.reqName        || '',
        recCompany:     body.recCompany     || '',
        recDept:        body.recDept        || '',
        recLocation:    body.recLocation    || '',
        recPersonnel:   body.recPersonnel   || '',
        recEmpId:       body.recEmpId       || '',
        recTitle:       body.recTitle       || '',
        recStatus:      body.recStatus      || '',
        snAdd:          body.snAdd          ?? false,
        snChange:       body.snChange       ?? false,
        snTerminate:    body.snTerminate     ?? false,
        snLAN:          body.snLAN          ?? false,
        snVPN:          body.snVPN          ?? false,
        snEmail:        body.snEmail        ?? false,
        snFileSharing:  body.snFileSharing  ?? false,
        snIntranet:     body.snIntranet     ?? false,
        snOther:        body.snOther        || '',
        hwAdd:          body.hwAdd          ?? false,
        hwChange:       body.hwChange       ?? false,
        hwTerminate:    body.hwTerminate     ?? false,
        hwPC:           body.hwPC           ?? false,
        hwPrinter:      body.hwPrinter      ?? false,
        hwNotebook:     body.hwNotebook     ?? false,
        hwMSOffice:     body.hwMSOffice     ?? false,
        hwAdobe:        body.hwAdobe        ?? false,
        hwZoom:         body.hwZoom         ?? false,
        hwOther:        body.hwOther        || '',
        erpAdd:         body.erpAdd         ?? false,
        erpChange:      body.erpChange      ?? false,
        erpTerminate:   body.erpTerminate   ?? false,
        erpPronto:      body.erpPronto      ?? false,
        erpSmartMining: body.erpSmartMining ?? false,
        erpPositionId:  body.erpPositionId  || '',
        erpDistrict:    body.erpDistrict    || '',
        erpRef:         body.erpRef         || '',
        erpSignOnId:    body.erpSignOnId    || '',
        erpGlobalProfile: body.erpGlobalProfile || '',
        additionalDesc: body.additionalDesc || '',
        costCode:       body.costCode       || '',
        justification:  body.justification  || '',
        techComment:    body.techComment    || '',
        techAD:         body.techAD         ?? false,
        techAW:         body.techAW         ?? false,
        techCR:         body.techCR         ?? false,
        techEM:         body.techEM         ?? false,
        techIP:         body.techIP         ?? false,
        techEP:         body.techEP         ?? false,
        sigRequester:   body.sigRequester   || '',
        sigSptDept:     body.sigSptDept     || '',
        sigDeptMgr:     body.sigDeptMgr     || '',
        sigSrMgr:       body.sigSrMgr       || '',
        sigHOO:         body.sigHOO         || '',
        sigITAdmin:     body.sigITAdmin     || '',
        sigMSDIMgr:     body.sigMSDIMgr     || '',
        status:         'pending',
        priority:       body.priority       || 'normal',
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (err) {
    console.error('POST /api/requests:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
