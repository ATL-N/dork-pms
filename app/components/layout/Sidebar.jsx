'use client'
import { useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/router";
import {
  Home,
  BarChart2,
  Users,
  Egg,
  Droplets,
  ShoppingCart,
  Package,
  Clipboard,
  FileText,
  Calendar,
  Settings,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const Sidebar = ({ open }) => {
//   const router = useRouter();
  const [openMenus, setOpenMenus] = useState({
    inventory: false,
    production: false,
    reports: false,
  });

  const toggleMenu = (menu) => {
    setOpenMenus({
      ...openMenus,
      [menu]: !openMenus[menu],
    });
  };

  const isActive = (path) => {
    // return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <Home size={20} />,
      path: "/",
      submenu: null,
    },
    {
      name: "Analytics",
      icon: <BarChart2 size={20} />,
      path: "/analytics",
      submenu: null,
    },
    {
      name: "Flock Management",
      icon: <Egg size={20} />,
      path: "/flocks",
      submenu: null,
    },
    {
      name: "Production",
      icon: <Clipboard size={20} />,
      submenu: "production",
      items: [
        { name: "Egg Collection", path: "/production/eggs" },
        { name: "Daily Records", path: "/production/daily" },
        { name: "Mortality", path: "/production/mortality" },
      ],
    },
    {
      name: "Inventory",
      icon: <Package size={20} />,
      submenu: "inventory",
      items: [
        { name: "Feed Stock", path: "/inventory/feed" },
        { name: "Medication", path: "/inventory/medication" },
        { name: "Equipment", path: "/inventory/equipment" },
      ],
    },
    {
      name: "Health",
      icon: <Droplets size={20} />,
      path: "/health",
      submenu: null,
    },
    {
      name: "Sales",
      icon: <ShoppingCart size={20} />,
      path: "/sales",
      submenu: null,
    },
    {
      name: "Staff",
      icon: <Users size={20} />,
      path: "/staff",
      submenu: null,
    },
    {
      name: "Reports",
      icon: <FileText size={20} />,
      submenu: "reports",
      items: [
        { name: "Production Reports", path: "/reports/production" },
        { name: "Financial Reports", path: "/reports/financial" },
        { name: "Inventory Reports", path: "/reports/inventory" },
      ],
    },
    {
      name: "Schedule",
      icon: <Calendar size={20} />,
      path: "/schedule",
      submenu: null,
    },
    {
      name: "Alerts",
      icon: <AlertTriangle size={20} />,
      path: "/alerts",
      submenu: null,
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/settings",
      submenu: null,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-card border-r border-border pt-header w-sidebar z-40 transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="h-full overflow-y-auto py-4">
        <nav>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index} className="mb-1">
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.submenu)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-left hover:bg-secondary rounded-md ${
                        openMenus[item.submenu] ? "bg-secondary" : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-foreground">
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          openMenus[item.submenu] ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {openMenus[item.submenu] && (
                      <ul className="ml-10 mt-1 space-y-1">
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              href={subItem.path}
                              className={`block px-4 py-2 rounded-md hover:bg-secondary ${
                                isActive(subItem.path)
                                  ? "bg-primary/10 text-primary"
                                  : ""
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={`flex items-center px-4 py-3 rounded-md hover:bg-secondary ${
                      isActive(item.path) ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <span className="mr-3 text-foreground">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
