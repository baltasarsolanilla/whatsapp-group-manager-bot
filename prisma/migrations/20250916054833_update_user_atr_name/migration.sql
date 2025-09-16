/*
  Warnings:

  - You are about to drop the column `whatsapp_user_ph` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "whatsapp_user_ph",
ADD COLUMN     "whatsapp_user_pn" TEXT;
