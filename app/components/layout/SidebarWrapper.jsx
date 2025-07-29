"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function SidebarWrapper({ sidebarOpen, setSidebarOpen }) {
  const { data: session } = useSession();
  return (
    <Sidebar
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      session={session}
    />
  );
}