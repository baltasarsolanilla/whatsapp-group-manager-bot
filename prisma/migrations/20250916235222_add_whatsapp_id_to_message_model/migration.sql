/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp_message_id]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `whatsapp_message_id` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."messages" ADD COLUMN     "whatsapp_message_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "messages_whatsapp_message_id_key" ON "public"."messages"("whatsapp_message_id");
