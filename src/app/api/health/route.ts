import { NextResponse } from "next/server";

// Health check endpoint used by AWS App Runner / ECS / ALB
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
