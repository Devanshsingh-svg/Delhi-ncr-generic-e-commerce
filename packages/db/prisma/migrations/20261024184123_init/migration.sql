-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMPTZ(6),
    "roles" TEXT[] DEFAULT ARRAY['CUSTOMER']::TEXT[],
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Molecule" (
    "id" UUID NOT NULL,
    "inn" TEXT NOT NULL,
    "isNarrowTherapeuticIndex" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Molecule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formulation" (
    "id" UUID NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "releaseType" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "moleculeId" UUID,

    CONSTRAINT "Formulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulationIngredient" (
    "id" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "moleculeId" UUID NOT NULL,
    "quantityMg" DECIMAL(10,3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormulationIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandMedicine" (
    "id" UUID NOT NULL,
    "brandName" TEXT NOT NULL,
    "formulationId" UUID NOT NULL,
    "manufacturerId" UUID NOT NULL,
    "regulatoryScheduleId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "BrandMedicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenericMedicine" (
    "id" UUID NOT NULL,
    "genericName" TEXT NOT NULL,
    "formulationId" UUID NOT NULL,
    "manufacturerId" UUID NOT NULL,
    "regulatoryScheduleId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "GenericMedicine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manufacturer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatorySchedule" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RegulatorySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DarkStore" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "addressId" UUID NOT NULL,
    "deliveryPolygon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DarkStore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DarkStoreLicense" (
    "id" UUID NOT NULL,
    "darkStoreId" UUID NOT NULL,
    "licenseType" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "issuedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DarkStoreLicense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacistAssignment" (
    "id" UUID NOT NULL,
    "darkStoreId" UUID NOT NULL,
    "pharmacistId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "effectiveFrom" TIMESTAMPTZ(6) NOT NULL,
    "effectiveTo" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacistAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryBatch" (
    "id" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "darkStoreId" UUID NOT NULL,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "batchNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "roles" TEXT[] DEFAULT ARRAY['CUSTOMER']::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "geo" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "rxNumber" TEXT NOT NULL,
    "prescriber" TEXT NOT NULL,
    "issuedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacistReview" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "pharmacistId" UUID NOT NULL,
    "reviewDecision" TEXT NOT NULL,
    "reviewedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PharmacistReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" UUID NOT NULL,
    "prescriptionId" UUID NOT NULL,
    "pharmacistId" UUID NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL,
    "endedAt" TIMESTAMPTZ(6),
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "riderId" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "trackingNo" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockReservation" (
    "id" UUID NOT NULL,
    "inventoryBatchId" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StockReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "response" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "entity" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CytotoxicDrug" (
    "id" UUID NOT NULL,
    "formulationId" UUID NOT NULL,
    "ppeRequired" BOOLEAN NOT NULL DEFAULT false,
    "segregatedStorage" BOOLEAN NOT NULL DEFAULT false,
    "pregnantWomanHandling" BOOLEAN NOT NULL DEFAULT false,
    "specialStorageRequired" BOOLEAN NOT NULL DEFAULT false,
    "handlingRestrictions" TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CytotoxicDrug_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_token_idx" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Molecule_inn_key" ON "Molecule"("inn");

-- CreateIndex
CREATE UNIQUE INDEX "Formulation_fingerprint_key" ON "Formulation"("fingerprint");

-- CreateIndex
CREATE INDEX "FormulationIngredient_formulationId_idx" ON "FormulationIngredient"("formulationId");

-- CreateIndex
CREATE INDEX "FormulationIngredient_moleculeId_idx" ON "FormulationIngredient"("moleculeId");

-- CreateIndex
CREATE UNIQUE INDEX "BrandMedicine_brandName_key" ON "BrandMedicine"("brandName");

-- CreateIndex
CREATE INDEX "BrandMedicine_formulationId_idx" ON "BrandMedicine"("formulationId");

-- CreateIndex
CREATE INDEX "BrandMedicine_manufacturerId_idx" ON "BrandMedicine"("manufacturerId");

-- CreateIndex
CREATE INDEX "BrandMedicine_regulatoryScheduleId_idx" ON "BrandMedicine"("regulatoryScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "GenericMedicine_genericName_key" ON "GenericMedicine"("genericName");

-- CreateIndex
CREATE INDEX "GenericMedicine_formulationId_idx" ON "GenericMedicine"("formulationId");

-- CreateIndex
CREATE INDEX "GenericMedicine_manufacturerId_idx" ON "GenericMedicine"("manufacturerId");

-- CreateIndex
CREATE INDEX "GenericMedicine_regulatoryScheduleId_idx" ON "GenericMedicine"("regulatoryScheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_name_key" ON "Manufacturer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Manufacturer_licenseNo_key" ON "Manufacturer"("licenseNo");

-- CreateIndex
CREATE UNIQUE INDEX "RegulatorySchedule_code_key" ON "RegulatorySchedule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DarkStore_name_key" ON "DarkStore"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DarkStore_licenseNumber_key" ON "DarkStore"("licenseNumber");

-- CreateIndex
CREATE INDEX "DarkStore_addressId_idx" ON "DarkStore"("addressId");

-- CreateIndex
CREATE INDEX "DarkStoreLicense_darkStoreId_idx" ON "DarkStoreLicense"("darkStoreId");

-- CreateIndex
CREATE INDEX "PharmacistAssignment_darkStoreId_idx" ON "PharmacistAssignment"("darkStoreId");

-- CreateIndex
CREATE INDEX "PharmacistAssignment_pharmacistId_idx" ON "PharmacistAssignment"("pharmacistId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryBatch_batchNumber_key" ON "InventoryBatch"("batchNumber");

-- CreateIndex
CREATE INDEX "InventoryBatch_formulationId_idx" ON "InventoryBatch"("formulationId");

-- CreateIndex
CREATE INDEX "InventoryBatch_darkStoreId_idx" ON "InventoryBatch"("darkStoreId");

-- CreateIndex
CREATE INDEX "InventoryBatch_batchNumber_idx" ON "InventoryBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_rxNumber_key" ON "Prescription"("rxNumber");

-- CreateIndex
CREATE INDEX "Prescription_customerId_idx" ON "Prescription"("customerId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_formulationId_idx" ON "PrescriptionItem"("formulationId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacistReview_prescriptionId_key" ON "PharmacistReview"("prescriptionId");

-- CreateIndex
CREATE INDEX "PharmacistReview_prescriptionId_idx" ON "PharmacistReview"("prescriptionId");

-- CreateIndex
CREATE INDEX "PharmacistReview_pharmacistId_idx" ON "PharmacistReview"("pharmacistId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_prescriptionId_key" ON "Consultation"("prescriptionId");

-- CreateIndex
CREATE INDEX "Consultation_prescriptionId_idx" ON "Consultation"("prescriptionId");

-- CreateIndex
CREATE INDEX "Consultation_pharmacistId_idx" ON "Consultation"("pharmacistId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_customerId_key" ON "Cart"("customerId");

-- CreateIndex
CREATE INDEX "Cart_customerId_idx" ON "Cart"("customerId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "CartItem_formulationId_idx" ON "CartItem"("formulationId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_formulationId_key" ON "CartItem"("cartId", "formulationId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_formulationId_idx" ON "OrderItem"("formulationId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_orderId_idx" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_riderId_idx" ON "Shipment"("riderId");

-- CreateIndex
CREATE INDEX "StockReservation_inventoryBatchId_idx" ON "StockReservation"("inventoryBatchId");

-- CreateIndex
CREATE INDEX "StockReservation_formulationId_idx" ON "StockReservation"("formulationId");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_email_key" ON "Rider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_phone_key" ON "Rider"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_key_key" ON "IdempotencyRecord"("key");

-- CreateIndex
CREATE INDEX "IdempotencyRecord_key_idx" ON "IdempotencyRecord"("key");

-- CreateIndex
CREATE INDEX "AuditEvent_entity_idx" ON "AuditEvent"("entity");

-- CreateIndex
CREATE INDEX "AuditEvent_action_idx" ON "AuditEvent"("action");

-- CreateIndex
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CytotoxicDrug_formulationId_key" ON "CytotoxicDrug"("formulationId");

-- CreateIndex
CREATE INDEX "CytotoxicDrug_formulationId_idx" ON "CytotoxicDrug"("formulationId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Formulation" ADD CONSTRAINT "Formulation_moleculeId_fkey" FOREIGN KEY ("moleculeId") REFERENCES "Molecule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationIngredient" ADD CONSTRAINT "FormulationIngredient_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulationIngredient" ADD CONSTRAINT "FormulationIngredient_moleculeId_fkey" FOREIGN KEY ("moleculeId") REFERENCES "Molecule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMedicine" ADD CONSTRAINT "BrandMedicine_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMedicine" ADD CONSTRAINT "BrandMedicine_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMedicine" ADD CONSTRAINT "BrandMedicine_regulatoryScheduleId_fkey" FOREIGN KEY ("regulatoryScheduleId") REFERENCES "RegulatorySchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericMedicine" ADD CONSTRAINT "GenericMedicine_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericMedicine" ADD CONSTRAINT "GenericMedicine_manufacturerId_fkey" FOREIGN KEY ("manufacturerId") REFERENCES "Manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenericMedicine" ADD CONSTRAINT "GenericMedicine_regulatoryScheduleId_fkey" FOREIGN KEY ("regulatoryScheduleId") REFERENCES "RegulatorySchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DarkStore" ADD CONSTRAINT "DarkStore_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DarkStoreLicense" ADD CONSTRAINT "DarkStoreLicense_darkStoreId_fkey" FOREIGN KEY ("darkStoreId") REFERENCES "DarkStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacistAssignment" ADD CONSTRAINT "PharmacistAssignment_darkStoreId_fkey" FOREIGN KEY ("darkStoreId") REFERENCES "DarkStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacistAssignment" ADD CONSTRAINT "PharmacistAssignment_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_darkStoreId_fkey" FOREIGN KEY ("darkStoreId") REFERENCES "DarkStore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacistReview" ADD CONSTRAINT "PharmacistReview_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacistReview" ADD CONSTRAINT "PharmacistReview_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_inventoryBatchId_fkey" FOREIGN KEY ("inventoryBatchId") REFERENCES "InventoryBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockReservation" ADD CONSTRAINT "StockReservation_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CytotoxicDrug" ADD CONSTRAINT "CytotoxicDrug_formulationId_fkey" FOREIGN KEY ("formulationId") REFERENCES "Formulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
