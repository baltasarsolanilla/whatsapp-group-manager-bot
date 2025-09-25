-- CreateEnum
CREATE TYPE "public"."RemovalOutcome" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "whatsapp_user_id" TEXT NOT NULL,
    "whatsapp_user_pn" TEXT,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."groups" (
    "id" TEXT NOT NULL,
    "whatsapp_group_id" TEXT NOT NULL,
    "name" TEXT,
    "inactivity_threshold_minutes" INTEGER NOT NULL DEFAULT 43200,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group_memberships" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "join_date" TIMESTAMP(3) NOT NULL,
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."messages" (
    "id" TEXT NOT NULL,
    "whatsapp_message_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "message_type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."whitelist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whitelist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."blacklist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."removal_queue" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "removal_queue_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "public"."webhook_events" (
    "id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "instance_name" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_user_id_key" ON "public"."users"("whatsapp_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_whatsapp_user_pn_key" ON "public"."users"("whatsapp_user_pn");

-- CreateIndex
CREATE UNIQUE INDEX "groups_whatsapp_group_id_key" ON "public"."groups"("whatsapp_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_memberships_user_id_group_id_key" ON "public"."group_memberships"("user_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_whatsapp_message_id_key" ON "public"."messages"("whatsapp_message_id");

-- CreateIndex
CREATE INDEX "messages_user_id_idx" ON "public"."messages"("user_id");

-- CreateIndex
CREATE INDEX "messages_group_id_idx" ON "public"."messages"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "whitelist_user_id_group_id_key" ON "public"."whitelist"("user_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "blacklist_user_id_group_id_key" ON "public"."blacklist"("user_id", "group_id");

-- CreateIndex
CREATE UNIQUE INDEX "removal_queue_user_id_group_id_key" ON "public"."removal_queue"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "removal_history_user_id_group_id_idx" ON "public"."removal_history"("user_id", "group_id");

-- CreateIndex
CREATE INDEX "webhook_events_event_type_idx" ON "public"."webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "webhook_events_instance_name_idx" ON "public"."webhook_events"("instance_name");

-- CreateIndex
CREATE INDEX "webhook_events_created_at_idx" ON "public"."webhook_events"("created_at");

-- AddForeignKey
ALTER TABLE "public"."group_memberships" ADD CONSTRAINT "group_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group_memberships" ADD CONSTRAINT "group_memberships_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."messages" ADD CONSTRAINT "messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whitelist" ADD CONSTRAINT "whitelist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."whitelist" ADD CONSTRAINT "whitelist_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blacklist" ADD CONSTRAINT "blacklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blacklist" ADD CONSTRAINT "blacklist_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."removal_queue" ADD CONSTRAINT "removal_queue_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."removal_queue" ADD CONSTRAINT "removal_queue_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."removal_history" ADD CONSTRAINT "removal_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."removal_history" ADD CONSTRAINT "removal_history_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
