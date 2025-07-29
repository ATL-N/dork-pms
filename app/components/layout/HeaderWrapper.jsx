"use client";

import { useSession } from "next-auth/react";
import Header from "./Header";

export default function HeaderWrapper({ sidebarOpen, toggleDarkMode, darkMode }) {
  const { data: session } = useSession();
  return (
    <Header
      sidebarOpen={sidebarOpen}
      toggleDarkMode={toggleDarkMode}
      darkMode={darkMode}
      session={session}
    />
  );
}