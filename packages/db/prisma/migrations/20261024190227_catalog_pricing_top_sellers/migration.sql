-- AlterTable
ALTER TABLE "Formulation" ADD COLUMN     "altBrandName" TEXT,
ADD COLUMN     "altEstimated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "altMrp" DECIMAL(10,2),
ADD COLUMN     "isTopSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mrp" DECIMAL(10,2),
ADD COLUMN     "unitPrice" DECIMAL(10,4);
