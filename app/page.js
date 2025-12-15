// app/page.js
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Feather, DollarSign, BarChart2, ShieldCheck, CheckCircle, Menu, X } from 'lucide-react';
import LoadingSpinner from './components/LoadingSpinner';

const DownloadAppBanner = () => {
  const apkUrl = "https://f003.backblazeb2.com/file/dorkpms/nkokoapp-v2.apk";
  return (
    <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Get the Mobile App!</h3>
          <p className="text-sm">Download the NkokoApp for a better mobile experience.</p>
        </div>
        <a
          href={apkUrl}
          download
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download APK
        </a>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderAuthButtons = (isMobile = false) => {
    const buttonClass = isMobile ? "w-full text-center" : "";
    if (status === 'loading') {
      return <div className={`w-36 h-10 flex items-center justify-center ${buttonClass}`}><LoadingSpinner size="h-6 w-6" /></div>;
    }
    if (status === 'authenticated') {
      return <Link href="/dashboard" className={`btn-primary ${buttonClass}`}>Go to Dashboard</Link>;
    }
    return (
      <>
        <Link href="/auth/signin" className={`text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors ${buttonClass}`}>Sign In</Link>
        <Link href="/auth/signup" className={`btn-primary ${buttonClass}`}>Get Started</Link>
      </>
    );
  };

  const navLinks = (
    <>
      <Link href="#features" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Features</Link>
      <Link href="/market" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Marketplace</Link>
      <Link href="#pricing" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Pricing</Link>
      <Link href="#contact" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Contact</Link>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[color:var(--border)] bg-[color:var(--background)]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Feather className="w-7 h-7 text-[color:var(--primary)]" />
              <span className="text-xl font-bold">Dork PMS</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">{navLinks}</nav>
            <div className="hidden md:flex items-center gap-4">
              {renderAuthButtons()}
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col items-center gap-4 border-t border-[color:var(--border)]">
              {navLinks}
              <div className="w-full flex flex-col items-center gap-4 pt-4 border-t border-[color:var(--border)]">
                {renderAuthButtons(true)}
              </div>
            </div>
          </div>
        )}
      </header>

      <DownloadAppBanner />

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 sm:py-28 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                The Future of Poultry Farm Management
              </h1>
              <p className="mt-6 text-lg text-[color:var(--muted-foreground)] max-w-lg mx-auto lg:mx-0">
                Streamline your operations, boost productivity, and increase
                profitability with our all-in-one solution.
              </p>
              {status !== "authenticated" && (
                <div className="mt-8 flex justify-center lg:justify-start">
                  <Link
                    href="/auth/signup"
                    className="btn-primary py-3 px-8 text-lg rounded-full transition-transform transform hover:scale-105"
                  >
                    Get Started for Free
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden lg:block">
              <img
                src="https://f003.backblazeb2.com/file/dorkpms/poultry-farm.jpg"
                alt="Modern Poultry Farm"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-(--muted)">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Why Choose Dork PMS?
              </h2>
              <p className="mt-4 text-lg text-(--muted-foreground)">
                An integrated platform designed to give you a bird's-eye view of
                your entire operation.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Feather,
                  title: "Complete Flock Management",
                  desc: "Track the entire lifecycle of your flocks, from hatch to sale, with detailed records.",
                },
                {
                  icon: DollarSign,
                  title: "Integrated Financials",
                  desc: "Manage expenses, revenues, and invoices with ease. Get a clear picture of your farm's financial health.",
                },
                {
                  icon: BarChart2,
                  title: "Powerful Analytics",
                  desc: "Make data-driven decisions with comprehensive reports on production, performance, and profitability.",
                },
                {
                  icon: ShieldCheck,
                  title: "Multi-User & Multi-Farm",
                  desc: "Collaborate with your team and manage multiple farms from a single, secure platform.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="card p-8 text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[color:var(--primary)] text-white mb-6">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-[color:var(--muted-foreground)]">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Simple, Transparent Pricing
              </h2>
              <p className="mt-4 text-lg text-[color:var(--muted-foreground)]">
                Choose the plan that's right for your farm. No hidden fees,
                ever.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <div className="card flex flex-col p-8 border-2">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="mt-2 text-[color:var(--muted-foreground)]">
                  Perfect for getting started.
                </p>
                <p className="my-6 text-5xl font-extrabold">
                  $0
                  <span className="text-lg font-medium text-[color:var(--muted-foreground)]">
                    /mo
                  </span>
                </p>
                <ul className="space-y-3 text-left mb-8">
                  {[
                    "1 Farm",
                    "2 Users",
                    "Full Feature Access",
                    "Community Support",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[color:var(--success)]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="btn-secondary w-full mt-auto"
                >
                  Choose Plan
                </Link>
              </div>
              {/* Pro Plan */}
              <div className="card flex flex-col p-8 border-2 border-[color:var(--primary)] relative">
                <span className="absolute -top-4 right-8 bg-[color:var(--primary)] text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </span>
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="mt-2 text-[color:var(--muted-foreground)]">
                  For growing farms that need more.
                </p>
                <p className="my-6 text-5xl font-extrabold">
                  $49
                  <span className="text-lg font-medium text-[color:var(--muted-foreground)]">
                    /mo
                  </span>
                </p>
                <ul className="space-y-3 text-left mb-8">
                  {[
                    "Up to 5 Farms",
                    "Up to 10 Users",
                    "Full Feature Access",
                    "Priority Support",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[color:var(--success)]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="btn-primary w-full mt-auto"
                >
                  Choose Plan
                </Link>
              </div>
              {/* Unlimited Plan */}
              <div className="card flex flex-col p-8 border-2">
                <h3 className="text-2xl font-bold">Unlimited</h3>
                <p className="mt-2 text-[color:var(--muted-foreground)]">
                  For large-scale operations.
                </p>
                <p className="my-6 text-5xl font-extrabold">
                  $99
                  <span className="text-lg font-medium text-[color:var(--muted-foreground)]">
                    /mo
                  </span>
                </p>
                <ul className="space-y-3 text-left mb-8">
                  {[
                    "Unlimited Farms",
                    "Unlimited Users",
                    "Full Feature Access",
                    "Dedicated Support & API",
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[color:var(--success)]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/signup"
                  className="btn-secondary w-full mt-auto"
                >
                  Choose Plan
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-[color:var(--muted)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-[color:var(--muted-foreground)]">
          <p>
            &copy; {new Date().getFullYear()} Dork PMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}