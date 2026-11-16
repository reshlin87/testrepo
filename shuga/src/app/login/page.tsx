import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, demoLoginEnabled } from "@/auth";
import { signInWith } from "@/app/actions";
import { FacebookLogo, GoogleLogo, SunMark } from "@/components/icons";

export const metadata = { title: "Welcome" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if ((await auth())?.user) redirect("/");
  const { error } = await searchParams;

  return (
    <main className="login">
      <span className="wordmark">Shu<i>ga</i></span>
      <div className="art">
        <SunMark className="sun" />
        <h1>Steady days, kept simply.</h1>
        <p className="lede">Your sugar, meals and mood in one calm place — and an easy way to keep your family and your clinic in the loop.</p>
      </div>

      {error && <p className="error" role="alert">That sign-in didn&rsquo;t go through. Please try again.</p>}

      <div className="providers">
        <form action={signInWith.bind(null, "google")}>
          <button className="provider" type="submit"><GoogleLogo /> Continue with Google</button>
        </form>
        <form action={signInWith.bind(null, "facebook")}>
          <button className="provider fb" type="submit"><FacebookLogo /> Continue with Facebook</button>
        </form>
        {demoLoginEnabled && (
          <form action={signInWith.bind(null, "demo")}>
            <button className="provider" type="submit" style={{ boxShadow: "none", background: "transparent" }}>Preview with demo account</button>
          </form>
        )}
      </div>
      <p className="fine">Shuga helps you keep track. It doesn&rsquo;t replace advice from your doctor, nurse or dietitian. Your entries are private to you. <Link href="/privacy">Privacy</Link></p>
    </main>
  );
}
