// Self-check: TZ=America/Sao_Paulo node lib/dates.check.mjs
import assert from "node:assert/strict";

import { addDays, formatDay, toDay } from "./dates.ts";

// 21:30 in São Paulo is already the next day in UTC; it must still be the 21st.
const lateEvening = new Date("2026-10-21T21:30:00-03:00");
assert.equal(toDay(lateEvening), "2026-10-21");
assert.equal(lateEvening.toISOString().slice(0, 10), "2026-10-22"); // the trap we avoid

assert.equal(addDays("2026-10-21", 1), "2026-10-22");
assert.equal(addDays("2026-10-21", -1), "2026-10-20");
assert.equal(addDays("2026-10-31", 1), "2026-11-01");
assert.equal(addDays("2026-01-01", -1), "2025-12-31");

assert.equal(formatDay("2026-10-21", "pt-BR"), "21 de out.");
assert.equal(formatDay("2026-10-21", "en"), "Oct 21");

console.log("dates self-check passed");
