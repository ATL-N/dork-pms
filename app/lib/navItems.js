// A simple helper for SVG icons to keep the component clean
const Icon = ({ path }) => (
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
    {path}
  </svg>
);

export const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: (
      <Icon
        path={
          <>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </>
        }
      />
    ),
  },
  {
    name: "Production",
    icon: (
      <Icon
        path={
          <>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </>
        }
      />
    ),
    submenu: true,
    items: [
      { name: "Egg Collection", path: "/production/eggs" },
      { name: "Daily Records", path: "/production/daily" },
      { name: "Mortality", path: "/production/mortality" },
    ],
  },
  {
    name: "Inventory",
    icon: (
      <Icon
        path={
          <>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </>
        }
      />
    ),
    submenu: true,
    items: [
      { name: "Feed Stock", path: "/inventory/feed" },
      { name: "Medication", path: "/inventory/medication" },
      { name: "Equipment", path: "/inventory/equipment" },
    ],
  },
  {
    name: "Financial Management",
    path: "/financial-management",
    icon: (
      <Icon
        path={
          <>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </>
        }
      />
    ),
  },
  {
    name: "Chat",
    path: "/chat",
    icon: (
      <Icon
        path={
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        }
      />
    ),
  },
  {
    name: "Reports & Analytics",
    path: "/reports-analytics",
    icon: (
      <Icon
        path={
          <>
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </>
        }
      />
    ),
  },
];
