-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "emailAddrs" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'admin',
    "department" TEXT NOT NULL DEFAULT '',
    "titleUser" TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_emailAddrs_key" ON "users"("emailAddrs");

-- CreateIndex
CREATE UNIQUE INDEX "users_userName_key" ON "users"("userName");

-- CreateIndex
CREATE INDEX "users_emailAddrs_idx" ON "users"("emailAddrs");

-- CreateIndex
CREATE INDEX "users_userName_idx" ON "users"("userName");
