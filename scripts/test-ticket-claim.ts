// PULSE — Verification Script for Ticket-Gated Fan Signup Logic
// Run via: npx tsx scripts/test-ticket-claim.ts
import { db } from "../lib/firebase";
import { doc, runTransaction } from "firebase/firestore";

async function simulateTicketClaim(ticketId: string, testName: string, uid: string) {
  console.info(`\n▶ [TEST CASE]: ${testName} (Ticket ID: ${ticketId})`);
  const ticketRef = doc(db, "tickets", ticketId);

  try {
    const claimedData = await runTransaction(db, async (transaction) => {
      const tSnap = await transaction.get(ticketRef);
      if (!tSnap.exists()) {
        throw new Error("Ticket not found or already used.");
      }
      const tData = tSnap.data();
      if (!tData?.valid || tData?.used) {
        throw new Error("Ticket not found or already used.");
      }
      // Lock and claim ticket atomically inside transaction
      transaction.update(ticketRef, {
        used: true,
        usedByUid: uid,
      });
      return tData;
    });
    console.info(`✅ [SUCCESS]: Claimed ticket ${ticketId} for UID ${uid}.`);
    console.info(`   Match: ${claimedData.matchName} | Seat: ${claimedData.seat}`);
  } catch (err: any) {
    console.error(`❌ [REJECTED]: ${err.message}`);
  }
}

async function runTests() {
  console.info("===============================================================");
  console.info("🎟️ VERIFYING FIRESTORE TRANSACTIONAL TICKET GATING LOGIC");
  console.info("===============================================================");

  // Test 1: Bogus Ticket
  await simulateTicketClaim("WC26-BOGUS", "1. Registering with Bogus Ticket", "test_fan_bogus");

  // Test 2: Valid Unused Ticket
  await simulateTicketClaim("WC26-DAL-00142", "2. Registering with Valid Unused Ticket", "test_fan_real_1");

  // Test 3: Double-Use Attempt right after
  await simulateTicketClaim("WC26-DAL-00142", "3. Attempting to claim WC26-DAL-00142 a second time", "test_fan_real_2");

  console.info("\n===============================================================\n");
  process.exit(0);
}

runTests();
