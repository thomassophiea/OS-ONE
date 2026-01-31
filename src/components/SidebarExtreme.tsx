import {
  Users,
  Wifi,
  MapPin,
  Settings,
  Brain,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  Cog,
  Network,
  Shield,
  UserCheck,
  UserPlus,
  BarChart3,
  Wrench,
  AppWindow,
  FileCheck,
  Database,
  Key,
  Download,
  Activity,
  Bell,
  HardDrive,
  LayoutDashboard,
  Eye,
  AlertCircle,
  Server,
  Layers
} from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { cn } from './ui/utils';
import { useBranding } from '@/lib/branding';
import { VersionBadge } from './VersionBadge';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface SidebarExtremeProps {
  onLogout: () => void;
  adminRole: string | null;
  currentPage: string;
  onPageChange: (page: string) => void;
  theme?: 'light' | 'dark' | 'system';
  onThemeToggle?: () => void;
}

// Menu structure matching Extreme Platform ONE
const menuSections = [
  {
    id: 'workspace',
    label: 'Workspace',
    icon: Layers,
    items: []
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Eye,
    items: [
      { id: 'service-levels', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'report-widgets', label: 'Visualize', icon: BarChart3 },
      { id: 'event-alarm-dashboard', label: 'Alerts', icon: AlertCircle },
      { id: 'access-points', label: 'Network Devices', icon: Server },
      { id: 'connected-clients', label: 'Clients', icon: Users },
    ]
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: Cog,
    items: [
      { id: 'configure-sites', label: 'Sites', icon: MapPin },
      { id: 'configure-networks', label: 'Network', icon: Network },
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileCheck,
    items: [
      { id: 'pci-report', label: 'PCI DSS Report', icon: FileCheck },
    ]
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions & Services',
    icon: Key,
    items: [
      { id: 'license-dashboard', label: 'Subscriptions & Licensing', icon: Key },
      { id: 'firmware-manager', label: 'Inventory', icon: Download },
    ]
  },
  {
    id: 'administration',
    label: 'Administration & Settings',
    icon: Settings,
    items: [
      { id: 'administration', label: 'Access Management', icon: UserCheck },
      { id: 'configure-policy', label: 'Alert Policies', icon: Shield },
      { id: 'configure-aaa-policies', label: 'External Notifications', icon: Bell },
      { id: 'system-backup', label: 'Backup & Restore', icon: Database },
      { id: 'tools', label: 'Integrations', icon: Wrench },
    ]
  }
];

export function SidebarExtreme({
  onLogout,
  adminRole,
  currentPage,
  onPageChange,
  theme = 'system',
  onThemeToggle
}: SidebarExtremeProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Auto-expand section containing current page
    const initialExpanded = new Set<string>();
    menuSections.forEach(section => {
      if (section.items.some(item => item.id === currentPage)) {
        initialExpanded.add(section.id);
      }
    });
    return initialExpanded;
  });
  const branding = useBranding();
  const device = useDeviceDetection();

  // Close mobile sidebar when page changes
  useEffect(() => {
    if (device.isMobile) {
      setIsMobileOpen(false);
    }
  }, [currentPage, device.isMobile]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && device.isMobile && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [device.isMobile, isMobileOpen]);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    if (device.isMobile) {
      setIsMobileOpen(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const isSectionActive = (section: typeof menuSections[0]) => {
    return section.items.some(item => item.id === currentPage);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {device.isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      {device.isMobile && (
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1a1a2e] border border-[#2a2a3d] shadow-lg lg:hidden"
        >
          <Menu className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Sidebar */}
      <div className={cn(
        "bg-[#1a1a2e] h-full flex flex-col transition-all duration-300 relative",
        // Purple accent bar on left
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-purple-600 before:to-purple-400",
        // Desktop behavior
        !device.isMobile && (isCollapsed ? "w-16" : "w-64"),
        // Mobile behavior
        device.isMobile && [
          "fixed inset-y-0 left-0 z-50 w-64",
          "transform transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        ]
      )}>
        {/* Header with collapse toggle */}
        <div className="p-3 border-b border-[#2a2a3d] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white hover:bg-[#2a2a3d] p-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuSections.map((section) => {
            const SectionIcon = section.icon;
            const isExpanded = expandedSections.has(section.id);
            const isActive = isSectionActive(section);
            const hasItems = section.items.length > 0;

            return (
              <div key={section.id} className="mb-1">
                {/* Section Header */}
                <button
                  onClick={() => hasItems && toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    isActive
                      ? "text-purple-400"
                      : "text-gray-400 hover:text-white hover:bg-[#252540]",
                    !hasItems && "cursor-default"
                  )}
                >
                  <SectionIcon className={cn("h-5 w-5 shrink-0", isCollapsed && "mx-auto")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium">{section.label}</span>
                      {hasItems && (
                        isExpanded
                          ? <ChevronDown className="h-4 w-4" />
                          : <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>

                {/* Section Items */}
                {!isCollapsed && isExpanded && hasItems && (
                  <div className="ml-4 border-l border-[#2a2a3d]">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isItemActive = currentPage === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => handlePageChange(item.id)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                            isItemActive
                              ? "text-purple-400 bg-purple-500/10"
                              : "text-gray-500 hover:text-gray-300 hover:bg-[#252540]"
                          )}
                        >
                          <ItemIcon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer with role and logout */}
        <div className="p-3 border-t border-[#2a2a3d] space-y-2">
          {!isCollapsed && adminRole && (
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-gray-500">{adminRole}</span>
              <VersionBadge />
            </div>
          )}
          <Button
            variant="ghost"
            onClick={onLogout}
            className={cn(
              "w-full justify-start text-gray-400 hover:text-white hover:bg-[#252540]",
              isCollapsed ? "px-2" : "px-3"
            )}
          >
            <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
}
