-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "formNumber" TEXT NOT NULL,
    "effectiveDate" TEXT NOT NULL,
    "reqCompany" TEXT NOT NULL,
    "reqName" TEXT NOT NULL,
    "recCompany" TEXT NOT NULL DEFAULT '',
    "recDept" TEXT NOT NULL DEFAULT '',
    "recLocation" TEXT NOT NULL DEFAULT '',
    "recPersonnel" TEXT NOT NULL DEFAULT '',
    "recEmpId" TEXT NOT NULL DEFAULT '',
    "recTitle" TEXT NOT NULL DEFAULT '',
    "recStatus" TEXT NOT NULL DEFAULT '',
    "snAdd" BOOLEAN NOT NULL DEFAULT false,
    "snChange" BOOLEAN NOT NULL DEFAULT false,
    "snTerminate" BOOLEAN NOT NULL DEFAULT false,
    "snLAN" BOOLEAN NOT NULL DEFAULT false,
    "snVPN" BOOLEAN NOT NULL DEFAULT false,
    "snEmail" BOOLEAN NOT NULL DEFAULT false,
    "snFileSharing" BOOLEAN NOT NULL DEFAULT false,
    "snIntranet" BOOLEAN NOT NULL DEFAULT false,
    "snOther" TEXT NOT NULL DEFAULT '',
    "hwAdd" BOOLEAN NOT NULL DEFAULT false,
    "hwChange" BOOLEAN NOT NULL DEFAULT false,
    "hwTerminate" BOOLEAN NOT NULL DEFAULT false,
    "hwPC" BOOLEAN NOT NULL DEFAULT false,
    "hwPrinter" BOOLEAN NOT NULL DEFAULT false,
    "hwNotebook" BOOLEAN NOT NULL DEFAULT false,
    "hwMSOffice" BOOLEAN NOT NULL DEFAULT false,
    "hwAdobe" BOOLEAN NOT NULL DEFAULT false,
    "hwZoom" BOOLEAN NOT NULL DEFAULT false,
    "hwOther" TEXT NOT NULL DEFAULT '',
    "erpAdd" BOOLEAN NOT NULL DEFAULT false,
    "erpChange" BOOLEAN NOT NULL DEFAULT false,
    "erpTerminate" BOOLEAN NOT NULL DEFAULT false,
    "erpPronto" BOOLEAN NOT NULL DEFAULT false,
    "erpSmartMining" BOOLEAN NOT NULL DEFAULT false,
    "erpPositionId" TEXT NOT NULL DEFAULT '',
    "erpDistrict" TEXT NOT NULL DEFAULT '',
    "erpRef" TEXT NOT NULL DEFAULT '',
    "erpSignOnId" TEXT NOT NULL DEFAULT '',
    "erpGlobalProfile" TEXT NOT NULL DEFAULT '',
    "additionalDesc" TEXT NOT NULL DEFAULT '',
    "costCode" TEXT NOT NULL DEFAULT '',
    "justification" TEXT NOT NULL DEFAULT '',
    "techComment" TEXT NOT NULL DEFAULT '',
    "techAD" BOOLEAN NOT NULL DEFAULT false,
    "techAW" BOOLEAN NOT NULL DEFAULT false,
    "techCR" BOOLEAN NOT NULL DEFAULT false,
    "techEM" BOOLEAN NOT NULL DEFAULT false,
    "techIP" BOOLEAN NOT NULL DEFAULT false,
    "techEP" BOOLEAN NOT NULL DEFAULT false,
    "sigRequester" TEXT NOT NULL DEFAULT '',
    "sigSptDept" TEXT NOT NULL DEFAULT '',
    "sigDeptMgr" TEXT NOT NULL DEFAULT '',
    "sigSrMgr" TEXT NOT NULL DEFAULT '',
    "sigHOO" TEXT NOT NULL DEFAULT '',
    "sigITAdmin" TEXT NOT NULL DEFAULT '',
    "sigMSDIMgr" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "itNotes" TEXT NOT NULL DEFAULT '',
    "assignedTo" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "requests_formNumber_key" ON "requests"("formNumber");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_priority_idx" ON "requests"("priority");

-- CreateIndex
CREATE INDEX "requests_createdAt_idx" ON "requests"("createdAt");

-- CreateIndex
CREATE INDEX "requests_reqName_idx" ON "requests"("reqName");

-- CreateIndex
CREATE INDEX "requests_formNumber_idx" ON "requests"("formNumber");
