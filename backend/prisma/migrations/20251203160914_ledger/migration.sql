-- CreateEnum
CREATE TYPE "LedgerAccountType" AS ENUM ('CASH', 'CUSTOMER', 'SUPPLIER');

-- CreateTable
CREATE TABLE "LedgerAccount" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LedgerAccountType" NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LedgerAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "refType" TEXT,
    "refId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LedgerAccount" ADD CONSTRAINT "LedgerAccount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "LedgerAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
