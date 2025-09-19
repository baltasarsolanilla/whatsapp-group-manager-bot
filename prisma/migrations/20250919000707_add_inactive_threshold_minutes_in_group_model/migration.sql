-- AlterTable
ALTER TABLE "public"."groups" ADD COLUMN     "inactivity_threshold_minutes" INTEGER NOT NULL DEFAULT 43200;
