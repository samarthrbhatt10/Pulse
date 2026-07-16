import { NextResponse } from "next/server";
import { seedFirestoreIfEmpty } from "@/lib/firestore/db";

export async function POST() {
  const success = await seedFirestoreIfEmpty();
  if (success) {
    return NextResponse.json({ success: true, message: "Firestore database successfully seeded with initial ZONES and INCIDENTS." });
  }
  return NextResponse.json(
    { success: false, message: "Failed to seed Firestore. Please check your Firebase rules and credentials." },
    { status: 500 }
  );
}

export async function GET() {
  const success = await seedFirestoreIfEmpty();
  if (success) {
    return NextResponse.json({ success: true, message: "Firestore database successfully seeded with initial ZONES and INCIDENTS." });
  }
  return NextResponse.json(
    { success: false, message: "Failed to seed Firestore. Please check your Firebase rules and credentials." },
    { status: 500 }
  );
}
