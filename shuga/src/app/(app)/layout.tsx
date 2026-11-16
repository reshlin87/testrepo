import { requireUser } from "@/lib/session";
import { TabBar } from "@/components/TabBar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <>
      <main className="shell">{children}</main>
      <TabBar />
    </>
  );
}
