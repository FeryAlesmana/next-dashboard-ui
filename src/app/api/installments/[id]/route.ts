// app/api/installments/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function safeNumber(val: any) {
  return val && typeof val === "object" && typeof val.toNumber === "function"
    ? val.toNumber()
    : Number(val);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const installmentId = Number(params.id);
  if (!installmentId || isNaN(installmentId)) {
    return NextResponse.json(
      { success: false, error: true, message: "Invalid installment id" },
      { status: 400 }
    );
  }

  try {
    const inst = await prisma.paymentInstallment.findUnique({
      where: { id: installmentId },
    });
    if (!inst) {
      return NextResponse.json(
        { success: false, error: true, message: "Installment not found" },
        { status: 404 }
      );
    }

    const paymentLogId = inst.paymentLogId;

    await prisma.paymentInstallment.delete({ where: { id: installmentId } });

    const updated = await prisma.paymentInstallment.findMany({
      where: { paymentLogId },
      orderBy: { createdAt: "asc" },
    });

    const mapped = updated.map((u) => ({
      id: u.id,
      amount: safeNumber(u.amount),
      paidAt: u.paidAt ? u.paidAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      error: false,
      message: "Installment deleted",
      data: { paymentLogId, installments: mapped },
    });
  } catch (err) {
    console.error("Delete installment error:", err);
    return NextResponse.json(
      { success: false, error: true, message: "Server error" },
      { status: 500 }
    );
  }
}
