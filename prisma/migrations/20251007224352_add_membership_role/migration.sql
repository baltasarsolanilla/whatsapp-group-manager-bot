-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('MEMBER', 'ADMIN');

-- AlterTable
ALTER TABLE "group_memberships" ADD COLUMN "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER';
