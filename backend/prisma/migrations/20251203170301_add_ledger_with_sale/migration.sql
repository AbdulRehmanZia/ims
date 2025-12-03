-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "customerAccountId" INTEGER;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_customerAccountId_fkey" FOREIGN KEY ("customerAccountId") REFERENCES "LedgerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
