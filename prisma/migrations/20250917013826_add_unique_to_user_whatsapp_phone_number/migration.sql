/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp_user_pn]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_user_pn_key" ON "public"."users"("whatsapp_user_pn");
