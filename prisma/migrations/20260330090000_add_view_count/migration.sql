-- AlterTable
ALTER TABLE "Article" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Article_viewCount_idx" ON "Article"("viewCount");
