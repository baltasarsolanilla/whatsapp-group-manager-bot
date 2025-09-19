/*
  Warnings:

  - You are about to drop the column `processed_at` on the `removal_queue` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `removal_queue` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."removal_queue_created_at_idx";

-- DropIndex
DROP INDEX "public"."removal_queue_status_idx";

-- AlterTable
ALTER TABLE "public"."removal_queue" DROP COLUMN "processed_at",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "public"."removal_status";
