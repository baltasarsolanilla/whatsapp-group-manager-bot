-- CreateEnum
CREATE TYPE "public"."RemovalOutcome" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "public"."removal_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "outcome" "public"."RemovalOutcome" NOT NULL,
    "reason" TEXT,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "removal_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "removal_history_user_id_group_id_idx" ON "public"."removal_history"("user_id", "group_id");

-- AddForeignKey
ALTER TABLE "public"."removal_history" ADD CONSTRAINT "removal_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."removal_history" ADD CONSTRAINT "removal_history_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
