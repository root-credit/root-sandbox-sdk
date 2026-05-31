import Link from 'next/link';
import { branding } from '@/lib/branding';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <CoinbaseLogo />
            <span className="text-xl font-extrabold tracking-tight">{branding.productName}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-muted-foreground">
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#assets" className="hover:text-foreground transition-colors">Assets</a>
            <a href="#wallet" className="hover:text-foreground transition-colors">{branding.walletName}</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="font-bold text-muted-foreground hover:text-foreground" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-5"
              asChild
            >
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Crypto made simple
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-[1.02] mb-6">
            Buy, sell &amp; hold
            <br />
            <span className="text-primary">crypto</span> with confidence.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
            {branding.productName} is the most trusted place to buy and sell cryptocurrency.
            Fund your {branding.walletName} and start trading BTC, ETH, SOL, and USDC instantly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-full px-8 h-13 text-base"
              asChild
            >
              <Link href="/signup">Create account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-13 text-base font-bold border-border hover:bg-secondary"
              asChild
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        {/* Mock price ticker */}
        <div className="mx-auto max-w-4xl px-6 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <AssetTicker symbol="BTC" name="Bitcoin" price="$67,432.18" change="+2.4%" up />
            <AssetTicker symbol="ETH" name="Ethereum" price="$3,521.90" change="+1.8%" up />
            <AssetTicker symbol="SOL" name="Solana" price="$182.44" change="-0.6%" up={false} />
            <AssetTicker symbol="USDC" name="USD Coin" price="$1.00" change="0.0%" up />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
              Start trading in minutes.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Three steps to your first crypto trade.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Step n="01" title={`Fund your ${branding.walletName}`} body={`Link your bank account and pull funds via ACH into your ${branding.walletName} — your in-app USD balance ready for trading.`} />
            <Step n="02" title="Buy or sell crypto" body="Choose from BTC, ETH, SOL, or USDC. Enter a USD amount, see the live rate, and execute instantly from your balance." />
            <Step n="03" title={`${branding.payoutVerb} when ready`} body={`Move your USD back to a linked ${branding.funderShortLabel.toLowerCase()} or debit card. Settlements are fast and fully tracked.`} />
          </div>
        </div>
      </section>

      {/* Assets */}
      <section id="assets" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Supported assets</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Trade the top assets.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <AssetCard symbol="BTC" name="Bitcoin" desc="The original cryptocurrency and digital store of value." color="oklch(0.75 0.15 60)" />
            <AssetCard symbol="ETH" name="Ethereum" desc="Smart contracts and the backbone of DeFi." color="oklch(0.65 0.12 280)" />
            <AssetCard symbol="SOL" name="Solana" desc="High-speed blockchain for DeFi and NFTs." color="oklch(0.65 0.18 155)" />
            <AssetCard symbol="USDC" name="USD Coin" desc="The fully-reserved, dollar-backed stablecoin." color="oklch(0.55 0.22 255)" />
          </div>
        </div>
      </section>

      {/* Wallet CTA */}
      <section id="wallet" className="bg-primary py-20 md:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/60 mb-4">Your balance</p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary-foreground mb-5">
            {branding.walletName}.
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed max-w-xl mx-auto mb-8">
            One USD balance for all your trades. Fund it with ACH, buy crypto, sell it back,
            and cash out — all on one clean ledger.
          </p>
          <Button
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 font-bold rounded-full px-8 text-base"
            asChild
          >
            <Link href="/signup">Open your account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CoinbaseLogo small />
            <span className="text-sm font-bold">{branding.productName}</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {'© '}{new Date().getFullYear()} {branding.productName} · Powered by Root · Sandbox environment.
          </p>
        </div>
      </footer>
    </main>
  );
}

function CoinbaseLogo({ small }: { small?: boolean }) {
  const size = small ? 'h-6 w-6' : 'h-9 w-9';
  return (
    <div className={`flex ${size} items-center justify-center rounded-full bg-primary`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-2/3 w-2/3">
        <circle cx="12" cy="12" r="10" fill="white" fillOpacity="0.2" />
        <path d="M12 4C7.58 4 4 7.58 4 12C4 16.42 7.58 20 12 20C16.42 20 20 16.42 20 12C20 7.58 16.42 4 12 4ZM12 16.5C9.51 16.5 7.5 14.49 7.5 12C7.5 9.51 9.51 7.5 12 7.5C14.49 7.5 16.5 9.51 16.5 12C16.5 14.49 14.49 16.5 12 16.5Z" fill="white" />
      </svg>
    </div>
  );
}

function AssetTicker({ symbol, name, price, change, up }: { symbol: string; name: string; price: string; change: string; up: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between gap-3">
      <div>
        <div className="font-bold text-sm">{symbol}</div>
        <div className="text-xs text-muted-foreground">{name}</div>
      </div>
      <div className="text-right">
        <div className="font-mono font-bold text-sm">{price}</div>
        <div className={`text-xs font-bold ${up ? 'text-accent' : 'text-destructive'}`}>{change}</div>
      </div>
    </div>
  );
}

function AssetCard({ symbol, name, desc, color }: { symbol: string; name: string; desc: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-sm text-white mb-4"
        style={{ background: color }}
      >
        {symbol}
      </div>
      <h3 className="font-bold text-lg mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border p-7 bg-card hover:border-primary/50 transition-colors">
      <div className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-12 w-12 text-lg font-extrabold mb-4">
        {n}
      </div>
      <h3 className="text-xl font-extrabold tracking-tight mb-2">{title}</h3>
      <p className="text-base text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
