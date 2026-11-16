import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** Loads the signed-in user or sends them to the right door. */
export async function requireUser(opts: { allowUnonboarded?: boolean } = {}) {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect("/login");
  if (!user.onboarded && !opts.allowUnonboarded) redirect("/welcome");
  return user;
}

export const displayName = (u: { preferredName: string | null; name: string | null }) =>
  u.preferredName?.trim() || u.name?.split(" ")[0] || "there";
