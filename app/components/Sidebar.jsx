"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
// import { navItems } from "../lib/navItems"; // We'll create this for cleaner code

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <div
      className={`bg-[color:var(--card)] text-[color:var(--card-foreground)] border-r border-[color:var(--border)] transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      } flex flex-col`}
    >
      <div className="p-4 flex items-center gap-3 border-b border-[color:var(--border)] h-16">
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
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-[color:var(--accent)] text-[color:var(--foreground)] transition-colors"
                title={item.name}
              >
                <span className={`text-[color:var(--primary)]`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
// ```

// **For cleaner code**, I've extracted the navigation array into its own file. Create a `lib` folder in your `app` directory and add `navItems.js`.

// #### `app/lib/navItems.js`

// ```javascript
// A simple helper for SVG icons to keep the component clean
const Icon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {path}
    </svg>
);

export const navItems = [
    { name: "Dashboard", path: "/", icon: <Icon path={<><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>} /> },
    { name: "Flock Management", path: "/flock-management", icon: <Icon path={<><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></>} /> },
    { name: "Feed Management", path: "/feed-management", icon: <Icon path={<><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>} /> },
    { name: "Production Tracking", path: "/production-tracking", icon: <Icon path={<><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>} /> },
    { name: "Inventory Management", path: "/inventory-management", icon: <Icon path={<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>} /> },
    { name: "Financial Management", path: "/financial-management", icon: <Icon path={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>} /> },
    { name: "Employee Management", path: "/employee-management", icon: <Icon path={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} /> },
    { name: "Veterinarians", path: "/veterinarians", icon: <Icon path={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} /> },
    { name: "Chat", path: "/chat", icon: <Icon path={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>} /> },
    { name: "Reports & Analytics", path: "/reports-analytics", icon: <Icon path={<><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>} /> },
];