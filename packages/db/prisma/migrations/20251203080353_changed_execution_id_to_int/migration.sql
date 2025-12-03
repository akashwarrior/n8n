/*
  Warnings:

  - The primary key for the `node_executions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `node_executions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `workflow_executions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `workflow_executions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `executionId` on the `node_executions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "node_executions" DROP CONSTRAINT "node_executions_executionId_fkey";

-- AlterTable
ALTER TABLE "node_executions" DROP CONSTRAINT "node_executions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "executionId",
ADD COLUMN     "executionId" INTEGER NOT NULL,
ADD CONSTRAINT "node_executions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "workflow_executions" DROP CONSTRAINT "workflow_executions_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "node_executions_executionId_idx" ON "node_executions"("executionId");

-- AddForeignKey
ALTER TABLE "node_executions" ADD CONSTRAINT "node_executions_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "workflow_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
