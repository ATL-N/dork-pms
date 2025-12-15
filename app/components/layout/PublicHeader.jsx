"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Feather, Menu, X } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

export default function PublicHeader() {
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
      <Link href="/#features" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Features</Link>
      <Link href="/#pricing" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Pricing</Link>
      <Link href="/market" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Find Farms</Link>
      <Link href="/veterinarians" className="text-sm font-medium text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] transition-colors">Find a Vet</Link>
    </>
  );

  return (
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
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
  );
}
