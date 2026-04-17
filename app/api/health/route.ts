import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "AXE AI総務",
    timestamp: new Date().toISOString(),
    version: "0.1.0-alpha",
  });
}
