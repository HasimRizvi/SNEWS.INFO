/**
 * SNEWS.INFO setup checker
 * Run: node scripts/check-setup.mjs
 * Verifies your Supabase project is connected and configured correctly.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../apps/web/.env.local");

if (!existsSync(envPath)) {
  console.error("❌ apps/web/.env.local not found. Copy .env.example first.");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    })
);

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

function mask(token) {
  if (!token) return "(missing)";
  return token.length > 16 ? token.slice(0, 6) + "…" + token.slice(-6) : token;
}

const results = [];
const ok = (msg) => { results.push(`  ✅ ${msg}`); };
const bad = (msg) => { results.push(`  ❌ ${msg}`); };

console.log("\n── SNEWS.INFO setup check ──────────────────────────\n");

// 1. Keys
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const svc = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";

console.log("1) Environment keys");
if (url.includes("placeholder")) bad("NEXT_PUBLIC_SUPABASE_URL is still a placeholder");
else ok(`Project URL: ${url}`);
if (!anon) bad("NEXT_PUBLIC_SUPABASE_ANON_KEY missing");
else ok(`Anon key present (${mask(anon)})`);
if (!svc) bad("SUPABASE_SERVICE_ROLE_KEY missing");
else ok(`Service role key present (${mask(svc)})`);
if (anon === svc && anon) {
  bad("Anon key and service role key are IDENTICAL (they must be different keys)");
  console.log("     → Dashboard → Settings → API → copy the 'service_role' key");
} else if (anon && svc) ok("Keys are different");
const anonRole = decodeJwt(anon)?.role;
const svcRole = decodeJwt(svc)?.role;
if (anonRole) ok(`Anon key role: ${anonRole}`);
if (svcRole && svcRole !== "service_role") {
  bad(`Service key role is '${svcRole}' — must be 'service_role'`);
  console.log("     → Dashboard → Settings → API → copy the 'service_role' key");
} else if (svcRole) ok(`Service key role: ${svcRole}`);

// 2. Connectivity + tables
console.log("\n2) Database tables");
if (!url || !anon) {
  bad("Cannot test tables without URL + anon key");
} else {
  const headers = { apikey: anon, Authorization: `Bearer ${anon}` };
  for (const table of ["profiles", "events", "event_registrations", "research_papers", "audit_logs"]) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, { headers });
      if (res.ok) ok(`Table '${table}' exists`);
      else if (res.status === 404) bad(`Table '${table}' missing — run supabase/migrations/0001_init.sql in SQL Editor`);
      else bad(`Table '${table}' check failed (HTTP ${res.status})`);
    } catch {
      bad(`Could not reach ${url}`);
    }
  }
}

// 3. Seed data
console.log("\n3) Seed data");
try {
  const res = await fetch(`${url}/rest/v1/events?select=id`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  const events = await res.json();
  if (Array.isArray(events) && events.length > 0) ok(`${events.length} events present`);
  else {
    bad("0 events — run supabase/migrations/0002_seed.sql in SQL Editor");
  }
} catch {
  bad("Could not count events");
}

// 4. Auth settings
console.log("\n4) Auth settings");
try {
  const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anon } });
  const s = await res.json();
  if (s.disable_signup) bad("Signups are DISABLED in Supabase Auth settings");
  else ok("Signups enabled");
  if (s.mailer_autoconfirm === false) {
    bad("Email confirmation is ON — new accounts need a confirmation email click before login");
    console.log("     → Auth → Sign In / Providers → Email → toggle 'Confirm email' OFF (or check your inbox)");
  } else ok("Email confirmation off");
  if (!s.external?.email) bad("Email provider disabled");
  else ok("Email provider enabled");
} catch {
  bad("Could not read auth settings (network issue)");
}

// 5. AI
console.log("\n5) AI");
if (!env.GEMINI_API_KEY) bad("GEMINI_API_KEY missing");
else {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL ?? "gemini-flash-latest"}:generateContent?key=${env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: "OK" }] }] }),
      }
    );
    if (res.ok) ok(`Gemini model ${env.GEMINI_MODEL ?? "gemini-flash-latest"} works`);
    else bad(`Gemini API error (HTTP ${res.status}) — check key and model`);
  } catch {
    bad("Gemini API unreachable");
  }
}

console.log("\n────────────────────────────────────────────────────");
const fails = results.filter((r) => r.includes("❌")).length;
results.forEach((r) => console.log(r));
console.log(`\n${fails === 0 ? "🎉 ALL CHECKS PASSED — you are ready to go!" : `⚠ ${fails} issue(s) need fixing`}`);
