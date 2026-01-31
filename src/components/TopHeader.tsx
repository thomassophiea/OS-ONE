import { useState } from 'react';
import { Bell, ChevronDown, Grid3X3, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useBranding } from '@/lib/branding';

interface TopHeaderProps {
  siteName: string;
  onOpenNotifications?: () => void;
  userInitials?: string;
  userEmail?: string;
}

export function TopHeader({
  siteName,
  onOpenNotifications,
  userInitials = 'U',
  userEmail
}: TopHeaderProps) {
  const [siteMenuOpen, setSiteMenuOpen] = useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);
  const branding = useBranding();

  const getInitials = () => {
    if (userInitials) return userInitials;
    if (userEmail) {
      const parts = userEmail.split('@')[0].split(/[._-]/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="h-14 bg-[#1e1e2f] border-b border-[#2a2a3d] flex items-center justify-between px-4 shrink-0">
      {/* Left Side - Logo and Site Selector */}
      <div className="flex items-center gap-4">
        {/* Extreme Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-500 rounded flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-white font-normal text-sm">Extreme</span>
            <span className="text-white font-semibold text-sm">Platform ONE</span>
            <span className="text-gray-400 text-sm font-light">| Networking</span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[#3a3a4d]" />

        {/* Site Selector */}
        <Popover open={siteMenuOpen} onOpenChange={setSiteMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-300 hover:text-white hover:bg-[#2a2a3d] gap-2"
            >
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">{siteName}</span>
              <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-2 bg-[#252537] border-[#3a3a4d]"
            align="start"
            sideOffset={8}
          >
            <div className="text-xs text-gray-400 px-2 py-1 mb-1">Sites</div>
            <button
              className="w-full text-left px-2 py-2 text-sm text-white hover:bg-[#3a3a4d] rounded transition-colors"
              onClick={() => setSiteMenuOpen(false)}
            >
              {siteName}
            </button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications Bell */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-[#2a2a3d]"
          onClick={onOpenNotifications}
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User Avatar */}
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-[#2a2a3d]"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-purple-600 text-white text-xs font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>

        {/* Apps Grid Menu */}
        <Popover open={appsMenuOpen} onOpenChange={setAppsMenuOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-400 hover:text-white hover:bg-[#2a2a3d]"
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-64 p-3 bg-[#252537] border-[#3a3a4d]"
            align="end"
            sideOffset={8}
          >
            <div className="text-sm font-medium text-white mb-3">Apps</div>
            <div className="space-y-1">
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#3a3a4d] rounded transition-colors"
                onClick={() => setAppsMenuOpen(false)}
              >
                EDGE Management
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#3a3a4d] rounded transition-colors"
                onClick={() => {
                  window.open('https://cal.extremecloudiq.com/login', '_blank');
                  setAppsMenuOpen(false);
                }}
              >
                ExtremeCloud IQ
              </button>
            </div>
            <div className="mt-3 pt-3 border-t border-[#3a3a4d]">
              <div className="text-xs text-gray-500 text-center">
                {branding.name}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
