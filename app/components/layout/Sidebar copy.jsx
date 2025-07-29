'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Grid, 
  Feather, 
  Package, 
  TrendingUp, 
  Heart,
  DollarSign, 
  Box,
  BarChart2,
  Users, 
  MessageCircle, 
  ShieldCheck, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import React, { useState } from 'react';

const NavItem = ({ item, sidebarOpen }) => {
    const pathname = usePathname();
    const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

    if (item.children) {
        return (
            <li>
                <button
                    onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
                    className="flex items-center justify-between w-full gap-3 p-2 rounded-md hover:bg-[color:var(--accent)] text-[color:var(--foreground)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={20} className="text-[color:var(--primary)]" />
                        {sidebarOpen && <span>{item.name}</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={16} className={`transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`} />}
                </button>
                {isSubMenuOpen && sidebarOpen && (
                    <ul className="pl-6 pt-2 space-y-1">
                        {item.children.map(child => (
                            <li key={child.path}>
                                <Link
                                    href={child.path}
                                    className={`flex items-center gap-3 p-2 rounded-md text-sm hover:bg-[color:var(--accent)] text-[color:var(--foreground)] transition-colors ${
                                        pathname === child.path ? "bg-[color:var(--accent)]" : ""
                                    }`}
                                >
                                    {child.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </li>
        );
    }

    return (
        <li>
            <Link
                href={item.path}
                className={`flex items-center gap-3 p-2 rounded-md hover:bg-[color:var(--accent)] text-[color:var(--foreground)] transition-colors ${
                pathname === item.path ? "bg-[color:var(--accent)]" : ""
                }`}
            >
                <item.icon size={20} className="text-[color:var(--primary)]" />
                {sidebarOpen && <span>{item.name}</span>}
            </Link>
        </li>
    );
};


export default function Sidebar({ sidebarOpen, setSidebarOpen, session }) {
  const { currentFarm } = useFarm();

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: Grid, roles: ["OWNER", "MANAGER", "WORKER", "VET", "ADMIN"] },
    { 
        name: "Farm Operations", 
        icon: Feather, 
        roles: ["OWNER", "MANAGER", "WORKER"],
        children: [
            { name: "Flocks", path: "/flocks", icon: Feather },
            { name: "Feed", path: "/feed", icon: Package },
            { name: "Health", path: "/health", icon: Heart },
            { name: "Production", path: "/production", icon: TrendingUp },
        ]
    },
    {
        name: "Business",
        icon: DollarSign,
        roles: ["OWNER", "MANAGER"],
        children: [
            { name: "Finances", path: "/finances", icon: DollarSign },
            { name: "Inventory", path: "/inventory", icon: Box },
            { name: "Reports", path: "/reports", icon: BarChart2 },
        ]
    },
    {
        name: "Team",
        icon: Users,
        roles: ["OWNER", "MANAGER"],
        children: [
            { name: "Staff", path: "/staff", icon: Users },
            { name: "Chat", path: "/chat", icon: MessageCircle },
        ]
    },
    { name: "Veterinarians", path: "/veterinarians", icon: Heart, roles: ["VET"] },
    { name: "Admin", path: "/admin", icon: ShieldCheck, roles: ["ADMIN"] },
  ];

  const filterNavigation = (items, userType, userRole) => {
      return items.map(item => {
          if (item.children) {
              const filteredChildren = item.children.filter(child => {
                  // In the new structure, children don't have roles, they inherit from parent
                  return true; 
              });
              if (filteredChildren.length > 0 && item.roles.includes(userRole)) {
                  return { ...item, children: filteredChildren };
              }
          } else {
              if (item.roles.includes(userRole)) {
                  return item;
              }
          }
          return null;
      }).filter(Boolean);
  }

  const userType = session?.user?.userType;
  const farmerRole = currentFarm?.users?.find((user) => user.userId === session?.user?.id)?.role;
  const role = userType === 'ADMIN' ? 'ADMIN' : userType === 'VET' ? 'VET' : farmerRole;

  const filteredNavigation = filterNavigation(navigationItems, userType, role);

  return (
    <div
      className={`bg-[color:var(--card)] text-[color:var(--card-foreground)] border-r border-[color:var(--border)] transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}
        flex flex-col`}
    >
      <div className="p-4 flex items-center gap-3 border-b border-[color:var(--border)] h-16">
        <Link href="/dashboard" className="flex items-center gap-3">
            <Feather className="text-primary-500" size={28} />
            {sidebarOpen && <h1 className="text-xl font-bold text-[color:var(--primary)]">Dork PMS</h1>}
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredNavigation.map((item) => (
            <NavItem key={item.name} item={item} sidebarOpen={sidebarOpen} />
          ))}
        </ul>
      </nav>
    </div>
  );
}