-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_username_key" ON "Staff"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_password_key" ON "Staff"("password");
