/*
  Warnings:

  - A unique constraint covering the columns `[user_id,group_id]` on the table `removal_queue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "removal_queue_user_id_group_id_key" ON "public"."removal_queue"("user_id", "group_id");
