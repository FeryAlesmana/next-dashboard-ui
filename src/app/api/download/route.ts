import { NextResponse } from "next/server";
import os from "os";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get("file");

  if (!fileName) {
    return NextResponse.json({ error: "Missing file name" }, { status: 400 });
  }

  const filePath = path.join(os.tmpdir(), fileName);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=${fileName}`,
    },
  });
}
