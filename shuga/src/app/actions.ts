"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { fromLocalInput } from "@/lib/time";
import { DIABETES_TYPES, FOOD_TAGS, MEAL_KINDS, PORTIONS, READING_CONTEXTS, STARCH } from "@/lib/vocab";

async function uid() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  return id;
}

const str = (f: FormData, k: string) => {
  const v = f.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const oneOf = <T extends { id: string }>(list: readonly T[], v: string, fallback: string) =>
  list.some((x) => x.id === v) ? v : fallback;
const scale = (f: FormData, k: string) => {
  const n = Number(str(f, k));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
};
const yesNo = (f: FormData, k: string) => {
  const v = str(f, k);
  return v === "yes" ? true : v === "no" ? false : null;
};
const note = (f: FormData) => str(f, "note").slice(0, 500) || null;

/* Auth */
export async function signInWith(provider: "google" | "facebook" | "demo") {
  await signIn(provider, { redirectTo: "/" });
}
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

/* Logging */
export type FormState = { error?: string } | undefined;

export async function logReading(_: FormState, f: FormData): Promise<FormState> {
  const userId = await uid();
  const value = Number(str(f, "value").replace(",", "."));
  if (!Number.isFinite(value) || value < 1 || value > 35) {
    return { error: "Please enter a reading between 1 and 35 mmol/L." };
  }
  await prisma.glucoseReading.create({
    data: {
      userId,
      value: Math.round(value * 10) / 10,
      context: oneOf(READING_CONTEXTS, str(f, "context"), "other"),
      takenAt: fromLocalInput(f.get("at")),
      note: note(f),
    },
  });
  revalidatePath("/", "layout");
  redirect("/?saved=sugar");
}

export async function logMeal(_: FormState, f: FormData): Promise<FormState> {
  const userId = await uid();
  const tags = f.getAll("tags").filter((t): t is string => typeof t === "string" && (FOOD_TAGS as readonly string[]).includes(t));
  await prisma.meal.create({
    data: {
      userId,
      kind: oneOf(MEAL_KINDS, str(f, "kind"), "snack"),
      portion: oneOf(PORTIONS, str(f, "portion"), "moderate"),
      starch: oneOf(STARCH, str(f, "starch"), "some"),
      tags: tags.join(","),
      hungerBefore: scale(f, "hunger"),
      fullAfter: scale(f, "full"),
      eatenAt: fromLocalInput(f.get("at")),
      note: note(f),
    },
  });
  revalidatePath("/", "layout");
  redirect("/?saved=meal");
}

export async function logCheckIn(_: FormState, f: FormData): Promise<FormState> {
  const userId = await uid();
  const mood = scale(f, "mood");
  if (!mood) return { error: "Choose how you're feeling to save." };
  await prisma.checkIn.create({
    data: { userId, mood, energy: scale(f, "energy"), medsTaken: yesNo(f, "meds"), moved: yesNo(f, "moved"), note: note(f) },
  });
  revalidatePath("/", "layout");
  redirect("/?saved=feel");
}

export async function deleteEntry(f: FormData) {
  const userId = await uid();
  const id = str(f, "id");
  const kind = str(f, "kind");
  const where = { id, userId };
  if (kind === "reading") await prisma.glucoseReading.deleteMany({ where });
  if (kind === "meal") await prisma.meal.deleteMany({ where });
  if (kind === "checkin") await prisma.checkIn.deleteMany({ where });
  revalidatePath("/", "layout");
}

/* Profile */
export async function saveProfile(_: FormState, f: FormData): Promise<FormState> {
  const userId = await uid();
  const lo = Number(str(f, "targetLow").replace(",", "."));
  const hi = Number(str(f, "targetHigh").replace(",", "."));
  if (!(lo >= 2 && lo <= 10 && hi >= 5 && hi <= 20 && lo < hi)) {
    return { error: "Your target range looks unusual — check the low and high numbers." };
  }
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferredName: str(f, "preferredName").slice(0, 40) || null,
      diabetesType: oneOf(DIABETES_TYPES, str(f, "diabetesType"), "other"),
      targetLow: lo,
      targetHigh: hi,
      takesMeds: str(f, "takesMeds") !== "no",
      onboarded: true,
    },
  });
  revalidatePath("/", "layout");
  redirect(str(f, "from") === "settings" ? "/settings?saved=1" : "/");
}

export async function deleteAllData(f: FormData) {
  const userId = await uid();
  if (str(f, "confirm").toLowerCase() !== "delete") redirect("/settings?confirm=1");
  await prisma.user.delete({ where: { id: userId } });
  await signOut({ redirectTo: "/login" });
}
