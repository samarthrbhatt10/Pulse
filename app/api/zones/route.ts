import { NextRequest, NextResponse } from "next/server";
import { getZonesFromDb, updateZoneInDb } from "@/lib/firestore/db";

export async function GET() {
  const rawZones = await getZonesFromDb();
  
  // Simulate minor live sensor fluctuations if running in real-time mode
  const zones = rawZones.map((z) => ({
    ...z,
    percent: Math.min(100, Math.max(0, Math.round((z.percent + (Math.random() - 0.5) * 1.5) * 10) / 10)),
    lastUpdated: "Live",
  }));

  const totalCapacity = zones.reduce((acc, z) => acc + z.capacity, 0) || 66000;
  const totalAttendees = zones.reduce((acc, z) => acc + Math.round((z.capacity * z.percent) / 100), 0) || 54302;

  return NextResponse.json({
    zones,
    totalAttendees,
    totalCapacity,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { zoneId, updates } = body;

    if (zoneId && updates) {
      await updateZoneInDb(zoneId, updates);
    }

    const updatedZones = await getZonesFromDb();
    return NextResponse.json({ success: true, zones: updatedZones });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
