import { Nav } from "@/components/nav";
import { MyBets } from "@/components/my-bets";

export const metadata = { title: "My Bets - Turing Arena" };
export const dynamic = "force-dynamic";

export default function PortfolioPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 mx-auto max-w-3xl px-5 md:px-6 py-10 md:py-12">
        <header className="mb-8">
          <h1 className="text-[32px] font-semibold tracking-tight">My bets</h1>
          <p className="text-dim text-[14px] mt-1.5 max-w-2xl">
            Your TAUSDC balance, open positions, and settled results. Win a duel and claim
            your payout straight into your balance.
          </p>
        </header>
        <MyBets />
      </main>
    </>
  );
}
