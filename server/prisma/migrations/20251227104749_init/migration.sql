-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "policyId" TEXT,
    CONSTRAINT "Service_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "EscalationPolicy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EscalationPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EscalationStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "policyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "delayUsers" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "EscalationStep_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "EscalationPolicy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EscalationStep_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incident_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
