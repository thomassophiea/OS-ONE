import { Plus, RefreshCw, Monitor, Tv, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface RightActionBarProps {
  onRefresh?: () => void;
  onHelp?: () => void;
}

export function RightActionBar({ onRefresh, onHelp }: RightActionBarProps) {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-[#252540] hover:bg-[#2a2a3d] text-gray-400 hover:text-white border border-[#2a2a3d] rounded-md"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#252540] border-[#2a2a3d] text-white">
            Add New
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="h-9 w-9 p-0 bg-[#252540] hover:bg-[#2a2a3d] text-gray-400 hover:text-white border border-[#2a2a3d] rounded-md"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#252540] border-[#2a2a3d] text-white">
            Refresh
          </TooltipContent>
        </Tooltip>

        <div className="my-2 border-t border-[#2a2a3d]" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-purple-600 hover:bg-purple-700 text-white border border-purple-500 rounded-md"
            >
              <Monitor className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#252540] border-[#2a2a3d] text-white">
            View Dashboard
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-[#252540] hover:bg-[#2a2a3d] text-gray-400 hover:text-white border border-[#2a2a3d] rounded-md"
            >
              <Tv className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#252540] border-[#2a2a3d] text-white">
            TV Mode
          </TooltipContent>
        </Tooltip>

        <div className="my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onHelp}
              className="h-9 w-9 p-0 bg-[#252540] hover:bg-[#2a2a3d] text-gray-400 hover:text-white border border-[#2a2a3d] rounded-full"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-[#252540] border-[#2a2a3d] text-white">
            Help
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
