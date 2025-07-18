// app/layout.js
"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Bell, User, Moon, Sun, ChevronDown, Message } from "lucide-react";

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Check user preference
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    setDarkMode(!darkMode);
  };

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <div
            className={`bg-[color:var(--card)] text-[color:var(--card-foreground)] border-r border-[color:var(--border)] transition-all duration-300 ${
              sidebarOpen ? "w-64" : "w-20"
            } flex flex-col`}
          >
            <div className="p-4 flex items-center gap-3 border-b border-[color:var(--border)]">
              {sidebarOpen ? (
                <h1 className="text-xl font-bold text-[color:var(--primary)]">
                  Poultry Farm
                </h1>
              ) : (
                <span className="text-[color:var(--primary)] text-xl font-bold">
                  PF
                </span>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="ml-auto text-[color:var(--muted-foreground)]"
              >
                <Menu size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-1 px-3">
                {[
                  { name: "Dashboard222", path: "/", icon: "grid" },
                  {
                    name: "Flock Management",
                    path: "/flock-management",
                    icon: "feather",
                  },
                  {
                    name: "Feed Management",
                    path: "/feed-management",
                    icon: "package",
                  },
                  {
                    name: "Production Tracking",
                    path: "/production-tracking",
                    icon: "trending-up",
                  },
                  {
                    name: "Inventory Management",
                    path: "/inventory-management",
                    icon: "box",
                  },
                  {
                    name: "Financial Management",
                    path: "/financial-management",
                    icon: "dollar-sign",
                  },
                  {
                    name: "Employee Management",
                    path: "/employee-management",
                    icon: "users",
                  },
                  {
                    name: "Veterinarians",
                    path: "/veterinarians",
                    icon: "users",
                  },
                  {
                    name: "Chat",
                    path: "/chat",
                    icon: "message-circle",
                  },
                  {
                    name: "Reports & Analytics",
                    path: "/reports-analytics",
                    icon: "bar-chart-2",
                  },
                ].map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-[color:var(--accent)] text-[color:var(--foreground)] transition-colors"
                    >
                      <span className={`text-[color:var(--primary)]`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {item.icon === "grid" && (
                            <>
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                            </>
                          )}
                          {item.icon === "feather" && (
                            <>
                              <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                              <line x1="16" y1="8" x2="2" y2="22" />
                              <line x1="17.5" y1="15" x2="9" y2="15" />
                            </>
                          )}
                          {item.icon === "package" && (
                            <>
                              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </>
                          )}
                          {item.icon === "trending-up" && (
                            <>
                              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                              <polyline points="17 6 23 6 23 12" />
                            </>
                          )}
                          {item.icon === "box" && (
                            <>
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                              <line x1="12" y1="22.08" x2="12" y2="12" />
                            </>
                          )}
                          {item.icon === "dollar-sign" && (
                            <>
                              <line x1="12" y1="1" x2="12" y2="23" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </>
                          )}
                          {item.icon === "users" && (
                            <>
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </>
                          )}
                          {item.icon === "bar-chart-2" && (
                            <>
                              <line x1="18" y1="20" x2="18" y2="10" />
                              <line x1="12" y1="20" x2="12" y2="4" />
                              <line x1="6" y1="20" x2="6" y2="14" />
                            </>
                          )}
                        </svg>
                      </span>
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-[color:var(--card)] border-b border-[color:var(--border)] flex items-center px-6">
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-[color:var(--muted)]">
                  <Bell size={20} className="text-[color:var(--foreground)]" />
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-[color:var(--muted)]"
                >
                  {darkMode ? (
                    <Sun size={20} className="text-[color:var(--foreground)]" />
                  ) : (
                    <Moon
                      size={20}
                      className="text-[color:var(--foreground)]"
                    />
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

            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-6 bg-[color:var(--background)]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
