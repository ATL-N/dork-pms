"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Menu,
  ChevronDown,
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
  X, // Added for the close icon in the modal
} from "lucide-react";
import { useFarm } from "../../context/FarmContext"; // Make sure this path is correct

// --- Helper Functions and Data ---

// Define your navigation items with icons and roles
const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Grid,
    roles: ["OWNER", "MANAGER", "WORKER", "VET", "ADMIN"],
  },
  {
    name: "Farm Operations",
    icon: Feather,
    roles: ["OWNER", "MANAGER", "WORKER"],
    children: [
      { name: "Flocks", path: "/flocks" },
      { name: "Feed", path: "/feed" },
      { name: "Health", path: "/health" },
      { name: "Production", path: "/production" },
    ],
  },
  {
    name: "Business",
    icon: DollarSign,
    roles: ["OWNER", "MANAGER"],
    children: [
      { name: "Finances", path: "/finances" },
      { name: "Inventory", path: "/inventory" },
      { name: "Reports", path: "/reports" },
    ],
  },
  {
    name: "Team",
    icon: Users,
    roles: ["OWNER", "MANAGER"],
    children: [
      { name: "Staff", path: "/staff" },
      { name: "Chat", path: "/chat" },
    ],
  },
  {
    name: "Veterinarians",
    path: "/veterinarians",
    icon: Heart,
    roles: ["VET"],
  },
  { name: "Admin", path: "/admin", icon: ShieldCheck, roles: ["ADMIN"] },
];

// Function to filter navigation items based on user role
const filterNavigation = (items, userRole) => {
  return items
    .map((item) => {
      if (!item.roles.includes(userRole)) return null;
      return item;
    })
    .filter(Boolean);
};

// --- Custom Hooks ---

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);
  return matches;
};

// --- Components ---

// NavItem component for the main sidebar
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
          {sidebarOpen && (
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isSubMenuOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
        {isSubMenuOpen && sidebarOpen && (
          <ul className="pl-6 pt-2 space-y-1">
            {item.children.map((child) => (
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

// --- Modal for Submenus on Mobile ---
function SubMenuModal({ items, title, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end"
      onClick={onClose}
    >
      <div
        className="bg-[color:var(--card)] w-full max-w-md rounded-t-lg shadow-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[color:var(--primary)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[color:var(--muted-foreground)]"
          >
            <X size={24} />
          </button>
        </div>
        <ul>
          {items.map((subItem) => (
            <li key={subItem.path}>
              <Link
                href={subItem.path}
                className="block p-3 rounded-md hover:bg-[color:var(--accent)] text-[color:var(--foreground)] transition-colors"
                onClick={onClose}
              >
                {subItem.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Tabs component for smaller devices
function Tabs({ navItems }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState({ title: "", items: [] });

  const handleTabClick = (item) => {
    if (item.children && item.children.length > 0) {
      setActiveSubMenu({ title: item.name, items: item.children });
      setModalOpen(true);
    }
    // If no children, the Link component will handle navigation
  };

  const topLevelItems = navItems.map((item) => ({
    ...item,
    icon: <item.icon size={24} />,
  }));

  return (
    <>
      <nav className="fixed bottom-0 w-full bg-[color:var(--card)] border-t border-[color:var(--border)] md:hidden">
        <ul className="flex justify-around">
          {topLevelItems.map((item) => (
            <li key={item.name} className="flex-1">
              <Link
                href={item.children ? "#" : item.path}
                onClick={() => handleTabClick(item)}
                className="flex flex-col items-center justify-center p-2 text-center text-[color:var(--foreground)] hover:bg-[color:var(--accent)] transition-colors"
                title={item.name}
              >
                <span className="text-[color:var(--primary)]">{item.icon}</span>
                <span className="text-xs">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {modalOpen && (
        <SubMenuModal
          items={activeSubMenu.items}
          title={activeSubMenu.title}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// Main Sidebar component
function Sidebar({ session, navItems }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [width, setWidth] = useState(256);
  const isResizing = useRef(false);

  useEffect(() => {
    const savedSidebarOpen = localStorage.getItem("sidebarOpen");
    if (savedSidebarOpen !== null) setSidebarOpen(JSON.parse(savedSidebarOpen));
    const savedWidth = localStorage.getItem("sidebarWidth");
    if (savedWidth !== null) setWidth(parseInt(savedWidth, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);
  useEffect(() => {
    localStorage.setItem("sidebarWidth", width);
  }, [width]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback((e) => {
    if (isResizing.current) {
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 500) newWidth = 500;
      setWidth(newWidth);
    }
  }, []);

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="hidden md:flex">
      <div
        className="bg-[color:var(--card)] text-[color:var(--card-foreground)] border-r border-[color:var(--border)] flex flex-col transition-all duration-300"
        style={{ width: sidebarOpen ? `${width}px` : "80px" }}
      >
        <div className="p-4 flex items-center gap-3 border-b border-[color:var(--border)] h-16">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Feather className="text-primary-500" size={28} />
            {sidebarOpen && (
              <h1 className="text-xl font-bold text-[color:var(--primary)] whitespace-nowrap">
                Dork PMS
              </h1>
            )}
          </Link>
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
              <NavItem key={item.name} item={item} sidebarOpen={sidebarOpen} />
            ))}
          </ul>
        </nav>
      </div>
      <div
        className="w-2 h-full cursor-col-resize group"
        onMouseDown={handleMouseDown}
      >
        <div className="w-0.5 h-full bg-transparent group-hover:bg-[color:var(--primary)] transition-colors duration-200"></div>
      </div>
    </div>
  );
}

// Main component that renders either Sidebar or Tabs
export default function ResponsiveSidebar({ session }) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { currentFarm } = useFarm();

  const userType = session?.user?.userType;
  const farmerRole = currentFarm?.users?.find(
    (user) => user.userId === session?.user?.id
  )?.role;
  const role =
    userType === "ADMIN" ? "ADMIN" : userType === "VET" ? "VET" : farmerRole;

  const filteredNavItems = role ? filterNavigation(navigationItems, role) : [];

  if (isMobile) {
    return <Tabs navItems={filteredNavItems} />;
  }

  return <Sidebar session={session} navItems={filteredNavItems} />;
}
