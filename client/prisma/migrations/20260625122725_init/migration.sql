-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortId" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "styleSettings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_shortId_key" ON "qr_codes"("shortId");
