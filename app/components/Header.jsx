"use client";

import { useState } from "react";
import { Bell, User, Moon, Sun, ChevronDown } from "lucide-react";

export default function Header({ sidebarOpen, darkMode, toggleDarkMode }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[color:var(--card)] border-b border-[color:var(--border)] flex items-center px-6">
      {/* This empty div will push the other items to the right */}
      <div className="flex-1"></div>

      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-[color:var(--muted)]">
          <Bell size={20} className="text-[color:var(--foreground)]" />
        </button>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full hover:bg-[color:var(--muted)]"
          title="Toggle dark mode"
        >
          {darkMode ? (
            <Sun size={20} className="text-[color:var(--foreground)]" />
          ) : (
            <Moon size={20} className="text-[color:var(--foreground)]" />
          )}
        </button>
        <div className="relative">
          <button
            className="flex items-center gap-2"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white">
              <User size={16} />
            </div>
            {/* Show user info only when sidebar is open for a cleaner look */}
            {sidebarOpen && (
              <>
                <span>Admin</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[color:var(--card)] border border-[color:var(--border)] shadow-lg rounded-md z-10">
              <div className="py-1">
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-[color:var(--muted)]"
                >
                  My Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-[color:var(--muted)]"
                >
                  Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 hover:bg-[color:var(--muted)]"
                >
                  Sign Out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
