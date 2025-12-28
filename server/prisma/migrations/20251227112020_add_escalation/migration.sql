-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Incident" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "escalationLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Incident_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Incident_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Incident" ("assignedToId", "createdAt", "description", "id", "serviceId", "status", "title", "updatedAt") SELECT "assignedToId", "createdAt", "description", "id", "serviceId", "status", "title", "updatedAt" FROM "Incident";
DROP TABLE "Incident";
ALTER TABLE "new_Incident" RENAME TO "Incident";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
