import { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  Activity,
  Users,
  Wifi,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon?: ReactNode;
}

interface NavGroup {
  label: string;
  icon: ReactNode;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    label: 'Monitoring',
    icon: <Activity className="h-5 w-5" />,
    items: [
      { label: 'Dashboard', path: '/' },
      { label: 'Contextual Insights', path: '/contextual-insights' },
      { label: 'App Insights', path: '/app-insights' },
      { label: 'Connected Clients', path: '/connected-clients' },
      { label: 'Access Points', path: '/access-points' },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Monitoring: true,
  });

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 1024);
      if (width < 1024) {
        setIsNavOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleNav = () => setIsNavOpen(!isNavOpen);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setIsNavOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="h-screen w-screen bg-[#1e1f2a] flex flex-col overflow-hidden">
      {/* App Bar */}
      <header className="h-[84px] shrink-0 p-4">
        <div className="h-full bg-[#2d2f3e] rounded-lg shadow-lg flex items-center justify-between px-4">
          {/* Left: Logo and Nav Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleNav}
              className="p-2 rounded-lg hover:bg-[#4d4f63] transition-colors lg:hidden"
            >
              {isNavOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#6930DF] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-foreground font-semibold">Extreme</span>
                <span className="text-foreground ml-1">Platform ONE</span>
                <span className="text-muted-foreground mx-2">|</span>
                <span className="text-foreground">Networking</span>
              </div>
            </div>
          </div>

          {/* Right: User Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
              <span className="text-sm hidden md:block">Org Name / Account Name</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden px-4 pb-4 gap-4">
        {/* Mobile Overlay */}
        {isMobile && isNavOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsNavOpen(false)}
          />
        )}

        {/* Navigation Sidebar */}
        <aside
          className={`
            ${isNavOpen ? 'w-[280px]' : 'w-[52px]'}
            ${isMobile ? 'fixed left-4 top-[100px] z-50 h-[calc(100vh-116px)]' : 'relative'}
            bg-[#2d2f3e] rounded-lg shadow-lg shrink-0 transition-all duration-300 overflow-hidden flex flex-col
          `}
        >
          {/* Nav Toggle (Desktop) */}
          <button
            onClick={toggleNav}
            className="hidden lg:flex h-[52px] items-center justify-center hover:bg-[#4d4f63] transition-colors shrink-0"
          >
            <Menu className="h-6 w-6 text-foreground" />
          </button>

          {/* Navigation Groups */}
          <nav className="flex-1 overflow-y-auto py-2">
            {navigationGroups.map((group) => (
              <div key={group.label} className="mb-2">
                {/* Group Header */}
                <button
                  onClick={() => isNavOpen && toggleGroup(group.label)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 hover:bg-[#4d4f63] transition-colors
                    ${isNavOpen ? 'justify-between' : 'justify-center'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-foreground">{group.icon}</span>
                    {isNavOpen && (
                      <span className="text-foreground font-medium">{group.label}</span>
                    )}
                  </div>
                  {isNavOpen && (
                    expandedGroups[group.label] ? (
                      <ChevronUp className="h-5 w-5 text-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-foreground" />
                    )
                  )}
                </button>

                {/* Group Items */}
                {isNavOpen && expandedGroups[group.label] && (
                  <div className="mt-1">
                    {group.items.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 pl-12 text-left transition-colors
                          ${isActive(item.path)
                            ? 'bg-primary/20 text-primary border-l-2 border-primary'
                            : 'text-muted-foreground hover:bg-[#4d4f63] hover:text-foreground'
                          }
                        `}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 bg-[#2d2f3e] rounded-lg shadow-lg overflow-hidden">
          {children}
        </main>

        {/* Right Sidebar (Desktop only) */}
        <aside className="hidden xl:flex w-[56px] bg-[#2d2f3e] rounded-lg shadow-lg shrink-0 flex-col items-center py-4 gap-4">
          <button className="p-2 rounded-lg hover:bg-[#4d4f63] transition-colors" title="Dashboard">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#4d4f63] transition-colors" title="Insights">
            <Lightbulb className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#4d4f63] transition-colors" title="Clients">
            <Users className="h-5 w-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#4d4f63] transition-colors" title="Access Points">
            <Wifi className="h-5 w-5 text-muted-foreground" />
          </button>
        </aside>
      </div>
    </div>
  );
}
