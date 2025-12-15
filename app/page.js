// app/page.js
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Feather, DollarSign, BarChart2, ShieldCheck, CheckCircle, Menu, X, ShoppingCart } from 'lucide-react';
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

const FarmerFeatureCard = ({ icon: Icon, title, description }) => (
    <div className="card p-6">
        <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-[color:var(--primary)] text-white mr-6">
                <Icon size={24} />
            </div>
            <div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-[color:var(--muted-foreground)]">{description}</p>
            </div>
        </div>
    </div>
);

export default function LandingPage() {
  const { data: session, status } = useSession();

  return (
    <>
      <DownloadAppBanner />

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Farmer Hero Section */}
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
              <div className="mt-8 flex justify-center lg:justify-start">
                <Link
                  href={status === 'authenticated' ? "/dashboard" : "/auth/signup"}
                  className="btn-primary py-3 px-8 text-lg rounded-full transition-transform transform hover:scale-105"
                >
                  {status === 'authenticated' ? "Go to Dashboard" : "Get Started for Free"}
                </Link>
              </div>
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

        {/* Farmer Features Section */}
        <section id="features" className="py-20 sm:py-24 bg-[color:var(--muted)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl font-bold">
                        A Smarter Way to Manage Your Farm
                    </h2>
                    <p className="mt-4 text-lg text-[color:var(--muted-foreground)]">
                        From flock management to financial tracking, Dork PMS provides the tools you need to succeed.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FarmerFeatureCard
                        icon={BarChart2}
                        title="Powerful Analytics"
                        description="Stop guessing. Make data-driven decisions with comprehensive reports on production, performance, and profitability."
                    />
                    <FarmerFeatureCard
                        icon={DollarSign}
                        title="Integrated Financials"
                        description="Plug financial leaks. Manage expenses, revenues, and invoices with ease to get a clear picture of your farm's financial health."
                    />
                    <FarmerFeatureCard
                        icon={Feather}
                        title="Complete Flock Management"
                        description="Say goodbye to spreadsheets. Track the entire lifecycle of your flocks, from hatch to sale, with detailed digital records."
                    />
                    <FarmerFeatureCard
                        icon={ShieldCheck}
                        title="Health & Task Management"
                        description="Never miss a vaccination or task again. Automate schedules, monitor flock health, and keep impeccable records for compliance."
                    />
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

        {/* Customer-focused Section */}
        <section id="buy-eggs" className="py-20 sm:py-24 bg-[color:var(--muted)]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold">Looking to Buy Fresh Eggs?</h2>
                <p className="mt-4 text-lg text-[color:var(--muted-foreground)] max-w-2xl mx-auto">
                    Connect directly with local farmers, enjoy farm-fresh eggs, and save money by cutting out the middleman.
                </p>
                <div className="mt-8">
                    <Link
                        href="/market"
                        className="inline-flex items-center justify-center gap-2 btn-primary py-3 px-8 text-lg rounded-full transition-transform transform hover:scale-105"
                    >
                        <ShoppingCart className="w-6 h-6" />
                        Find Farms Near You
                    </Link>
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
    </>
  );
}