import { NextResponse } from "next/server";
import { getIncidentsFromDb } from "@/lib/firestore/db";

export async function GET() {
  const incidents = await getIncidentsFromDb();
  return NextResponse.json({
    incidents,
    timestamp: new Date().toISOString(),
  });
}
