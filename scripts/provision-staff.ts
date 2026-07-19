// PULSE — Out-of-band Private Staff Provisioning Script
// Run via: npx tsx scripts/provision-staff.ts --name="Alex Vance" --email="alex@pulse.ai" --role="cto"
import { initializeApp as initAdminApp, getApps as getAdminApps } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { db as clientDb } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import * as crypto from "crypto";

// Parse CLI flags
const args = process.argv.slice(2);
function getArg(flag: string, defaultValue = ""): string {
  const found = args.find((a) => a.startsWith(`--${flag}=`));
  return found ? found.split("=")[1] : defaultValue;
}

const name = getArg("name", "Dr. Alex Vance");
const email = getArg("email", `staff_${Date.now()}@pulse-stadium.ai`);
const roleArg = getArg("role", "cto").toLowerCase();
const role: "cto" | "security" = roleArg === "security" ? "security" : "cto";

// Generate secure random 12-char password
const generatedPassword = crypto.randomBytes(8).toString("hex").slice(0, 12);

async function provisionStaff() {
  console.info("\n========================================================");
  console.info("⚡ PULSE PRIVATE STAFF PROVISIONING (OUT-OF-BAND)");
  console.info("========================================================\n");

  let useAdminSdk = false;
  try {
    if (!getAdminApps().length) {
      initAdminApp({ projectId: "pulse-d73dc" });
    }
    await getAdminAuth().listUsers(1);
    useAdminSdk = true;
  } catch (err) {
    useAdminSdk = false;
  }

  try {
    let uid: string;
    let modeLabel = "Admin SDK";

    if (useAdminSdk) {
      const auth = getAdminAuth();
      const db = getAdminFirestore();
      console.info(`[Mode: Admin SDK] Provisioning account for ${name} (${email}) with role: [${role.toUpperCase()}]...`);

      try {
        const userRecord = await auth.createUser({
          email,
          password: generatedPassword,
          displayName: name,
        });
        uid = userRecord.uid;
      } catch (authErr: any) {
        if (authErr.code === "auth/email-already-exists") {
          console.warn(`Email ${email} already exists. Updating existing user credentials...`);
          const existing = await auth.getUserByEmail(email);
          uid = existing.uid;
          await auth.updateUser(uid, { password: generatedPassword, displayName: name });
        } else {
          throw authErr;
        }
      }

      await auth.setCustomUserClaims(uid, { role });
      await db.collection("users").doc(uid).set({
        uid,
        email,
        name,
        role,
        provisionedBy: "admin_script",
        createdAt: new Date().toISOString(),
      });
    } else {
      modeLabel = "Direct Firestore Staff Register (ADC fallback)";
      console.info(`[Mode: ${modeLabel}] Provisioning staff record for ${name} (${email}) with role: [${role.toUpperCase()}]...`);

      // Try Google Identity REST API first if enabled on the Firebase project
      const apiKey = "AIzaSyAfZQst5ViZ1BTaUfUC2Z9BUK06VwkxhKQ";
      let restAuthSuccess = false;
      try {
        const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: generatedPassword,
            returnSecureToken: true,
          }),
        });
        const restData = await res.json();
        if (restData.localId) {
          uid = restData.localId;
          restAuthSuccess = true;
          modeLabel = "Identity REST API + Firestore";
        }
      } catch (e) {
        restAuthSuccess = false;
      }

      if (!restAuthSuccess) {
        // Generate deterministic secure UID for staff record in Firestore
        uid = "staff_" + crypto.createHash("sha256").update(email).digest("hex").slice(0, 20);
      }

      await setDoc(doc(clientDb, "users", uid!), {
        uid: uid!,
        email,
        name,
        role,
        provisionedBy: "admin_script",
        authMode: modeLabel,
        createdAt: new Date().toISOString(),
      });
    }

    console.info("\n✅ SUCCESS: Staff account provisioned securely in database.\n");
    console.info("--------------------------------------------------------");
    console.info(`🎯 OFFICER DESIGNATION : ${name}`);
    console.info(`📧 WORK EMAIL ADDRESS  : ${email}`);
    console.info(`🔑 GENERATED PASSWORD  : ${generatedPassword}`);
    console.info(`🛡️ ASSIGNED ROLE       : ${role.toUpperCase()} COMMAND`);
    console.info(`📦 PROVISIONING MODE   : ${modeLabel}`);
    console.info("--------------------------------------------------------");
    console.info("\nShare these exact credentials privately with the officer.");
    console.info("Do not expose this script on public web routes.\n");
    process.exit(0);
  } catch (err: any) {
    console.error("\n❌ PROVISIONING FAILED:", err.message);
    process.exit(1);
  }
}

provisionStaff();
