import { NextRequest, NextResponse } from "next/server";
import { getIncidentsFromDb, saveIncidentToDb } from "@/lib/firestore/db";
import { Incident } from "@/lib/mockData";

export async function GET() {
  const incidents = await getIncidentsFromDb();
  return NextResponse.json({
    incidents,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, incident, id, updates } = body;

    const incidents = await getIncidentsFromDb();

    if (action === "resolve" && id) {
      const target = incidents.find((i) => i.id === id);
      if (target) {
        target.status = "resolved";
        await saveIncidentToDb(target);
      }
    } else if (action === "create" && incident) {
      await saveIncidentToDb(incident as Incident);
    } else if (id && updates) {
      const target = incidents.find((i) => i.id === id);
      if (target) {
        Object.assign(target, updates);
        await saveIncidentToDb(target);
      }
    }

    const updated = await getIncidentsFromDb();
    return NextResponse.json({ success: true, incidents: updated });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
