import { NextRequest, NextResponse } from "next/server";
import { stepSimulator } from "@/functions/simulator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const demoMode = Boolean(body.demoMode);
    const elapsedSeconds = Number(body.elapsedSeconds ?? 0);

    const result = await stepSimulator({ demoMode, elapsedSeconds });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API Simulator] POST Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const demoMode = searchParams.get("demo") === "true";
    const elapsedSeconds = Number(searchParams.get("elapsed") ?? 0);

    const result = await stepSimulator({ demoMode, elapsedSeconds });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[API Simulator] GET Error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
