/*
  Warnings:

  - You are about to drop the column `storeId` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `LedgerAccount` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `storeId` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StoreMembers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_storeId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerAccount" DROP CONSTRAINT "LedgerAccount_storeId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "_StoreMembers" DROP CONSTRAINT "_StoreMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_StoreMembers" DROP CONSTRAINT "_StoreMembers_B_fkey";

-- DropIndex
DROP INDEX "Category_name_storeId_key";

-- DropIndex
DROP INDEX "Product_name_storeId_key";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "LedgerAccount" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "storeId";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "storeId";

-- DropTable
DROP TABLE "Store";

-- DropTable
DROP TABLE "_StoreMembers";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
