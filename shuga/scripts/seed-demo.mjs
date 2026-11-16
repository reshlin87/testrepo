// Fills the demo account (AUTH_DEMO_LOGIN=true) with two weeks of realistic entries.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const H = 3600_000, D = 24 * H;
const sod = (() => { const d = new Date(Date.now() + 2 * H); d.setUTCHours(0, 0, 0, 0); return d.getTime() - 2 * H; })();
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];

const user = await prisma.user.upsert({
  where: { email: "demo@shuga.local" },
  update: { onboarded: true, preferredName: "Thandi" },
  create: { email: "demo@shuga.local", name: "Thandi Demo", preferredName: "Thandi", onboarded: true, diabetesType: "type2" },
});
await prisma.glucoseReading.deleteMany({ where: { userId: user.id } });
await prisma.meal.deleteMany({ where: { userId: user.id } });
await prisma.checkIn.deleteMany({ where: { userId: user.id } });

const plates = [["Pap", "Red meat", "Vegetables"], ["Rice", "Chicken", "Salad"], ["Bread", "Eggs"], ["Samp & beans", "Vegetables"], ["Pap", "Braai"], ["Fish", "Salad"], ["Potato", "Chicken", "Vegetables"]];
const now = Date.now();
for (let i = 13; i >= 0; i--) {
  const day = sod - i * D;
  const at = (h) => new Date(day + h * H + rnd(-0.4, 0.4) * H);
  const ok = (t) => t.getTime() < now;
  const r = [];
  const t1 = at(6.5); if (ok(t1)) r.push({ value: rnd(5.4, 7.8), context: "fasting", takenAt: t1 });
  const t2 = at(14.5); if (ok(t2)) r.push({ value: rnd(7, 12.5), context: "after_meal", takenAt: t2 });
  const t3 = at(21.5); if (ok(t3) && Math.random() > 0.3) r.push({ value: rnd(6, 9.5), context: "bedtime", takenAt: t3 });
  if (i === 9) r.push({ value: 3.6, context: "other", takenAt: at(11), note: "Felt shaky before lunch" });
  for (const x of r) await prisma.glucoseReading.create({ data: { userId: user.id, ...x, value: Math.round(x.value * 10) / 10 } });

  const meals = [
    { kind: "breakfast", h: 7.2, portion: "light", starch: pick(["little", "some"]), tags: pick([["Bread", "Eggs"], ["Pap", "Dairy"], ["Fruit", "Dairy"]]) },
    { kind: "lunch", h: 12.8, portion: pick(["moderate", "hearty"]), starch: pick(["some", "lots"]), tags: pick(plates) },
    { kind: "supper", h: 18.6, portion: "moderate", starch: pick(["little", "some", "lots"]), tags: pick(plates) },
  ];
  for (const m of meals) {
    const t = at(m.h); if (!ok(t) || Math.random() < 0.15) continue;
    await prisma.meal.create({ data: { userId: user.id, kind: m.kind, portion: m.portion, starch: m.starch, tags: m.tags.join(","), hungerBefore: Math.round(rnd(2, 4.4)), fullAfter: Math.round(rnd(2, 4.4)), eatenAt: t } });
  }
  const tc = at(20);
  if (ok(tc)) await prisma.checkIn.create({ data: { userId: user.id, mood: Math.round(rnd(2.6, 5)), energy: Math.round(rnd(2, 4.6)), medsTaken: Math.random() > 0.12, moved: Math.random() > 0.4, at: tc } });
}
console.log("Demo data ready for", user.email);
await prisma.$disconnect();
