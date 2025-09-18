-- AlterTable
ALTER TABLE "public"."groups" ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "name" DROP NOT NULL;
