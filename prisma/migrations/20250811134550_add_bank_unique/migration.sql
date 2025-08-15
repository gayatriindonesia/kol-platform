/*
  Warnings:

  - A unique constraint covering the columns `[paymentMethodId,name]` on the table `Bank` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bank_paymentMethodId_name_key" ON "Bank"("paymentMethodId", "name");
