// app/layout.js
"use client";

import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Providers } from "./providers";
import { FarmProvider } from "./context/FarmContext";
import { NotificationProvider } from "./context/NotificationContext";
import SidebarWrapper from "./components/layout/SidebarWrapper";
import HeaderWrapper from "./components/layout/HeaderWrapper";

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Only show sidebar and header for routes inside the app
  const showAppLayout = pathname !== '/';

  useEffect(() => {
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
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <body>
        <Providers>
          <NotificationProvider>
            <FarmProvider>
              {showAppLayout ? (
                <div className="flex h-screen overflow-hidden">
                  <SidebarWrapper sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <HeaderWrapper
                      sidebarOpen={sidebarOpen}
                      setSidebarOpen={setSidebarOpen}
                      toggleDarkMode={toggleDarkMode}
                      darkMode={darkMode}
                    />
                    <main className="flex-1 overflow-y-auto p-6 bg-[color:var(--background)]">
                      {children}
                    </main>
                  </div>
                </div>
              ) : (
                <main className="bg-[color:var(--background)]">
                  {children}
                </main>
              )}
            </FarmProvider>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
