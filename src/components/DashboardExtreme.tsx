import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Wifi,
  Server,
  Users,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';
import { apiService } from '../services/api';
import { useGlobalFilters } from '../hooks/useGlobalFilters';
import { cn } from './ui/utils';

interface SiteData {
  siteId: string;
  siteName: string;
  location?: string;
  alerts?: number;
  usageCapacityIssues?: number;
  deviceHealth?: string;
  deviceStatus?: string;
  clientHealth?: string;
}

interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  totalClients: number;
  wiredClients: number;
  wirelessClients: number;
  clientIssues: number;
  alerts: {
    total: number;
    critical: number;
    warning: number;
  };
}

export function DashboardExtreme() {
  const { filters } = useGlobalFilters();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    totalClients: 0,
    wiredClients: 0,
    wirelessClients: 0,
    clientIssues: 0,
    alerts: { total: 0, critical: 0, warning: 0 }
  });
  const [sites, setSites] = useState<SiteData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      // Fetch access points
      const aps = await apiService.getAccessPoints();
      const onlineAps = aps?.filter((ap: any) =>
        ap.connectionState === 'Connected' ||
        ap.operationalState === 'Online' ||
        ap.status === 'online'
      ).length || 0;

      // Fetch clients
      const clients = await apiService.getStations();
      const totalClients = clients?.length || 0;

      // Fetch notifications/alerts
      const notifications = await apiService.getNotifications?.() || [];
      const criticalAlerts = notifications.filter((n: any) =>
        n.severity === 'critical' || n.level === 'critical'
      ).length;
      const warningAlerts = notifications.filter((n: any) =>
        n.severity === 'warning' || n.level === 'warning'
      ).length;

      // Fetch sites
      const sitesData = await apiService.getSites();
      const formattedSites: SiteData[] = (sitesData || []).map((site: any) => ({
        siteId: site.id || site.siteId,
        siteName: site.name || site.siteName || site.displayName || 'Unknown Site',
        location: site.location || site.address || '',
        alerts: 0,
        usageCapacityIssues: 0,
        deviceHealth: 'good',
        deviceStatus: 'online',
        clientHealth: 'good'
      }));

      setStats({
        totalDevices: aps?.length || 0,
        onlineDevices: onlineAps,
        offlineDevices: (aps?.length || 0) - onlineAps,
        totalClients,
        wiredClients: 0,
        wirelessClients: totalClients,
        clientIssues: 0,
        alerts: {
          total: criticalAlerts + warningAlerts,
          critical: criticalAlerts,
          warning: warningAlerts
        }
      });
      setSites(formattedSites);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredSites = sites.filter(site =>
    site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusIcon = ({ hasIssues }: { hasIssues: boolean }) => (
    hasIssues
      ? <AlertCircle className="h-5 w-5 text-amber-500" />
      : <CheckCircle className="h-5 w-5 text-emerald-500" />
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-gray-400 hover:text-white hover:bg-[#252540]"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
          >
            <Filter className="h-4 w-4 mr-2" />
            Sites
          </Button>
        </div>
      </div>

      {/* Top Row - Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Alerts Card */}
        <Card className="bg-[#252540] border-[#2a2a3d]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Alerts</CardTitle>
              <span className="text-xs text-gray-500">Showing Alerts from Last 3 days</span>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12">
            {stats.alerts.total === 0 ? (
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">No Issues</span>
              </div>
            ) : (
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <span className="text-2xl font-bold text-white">{stats.alerts.total}</span>
                <span className="text-sm text-gray-400 block">Active Alerts</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage & Capacity Card */}
        <Card className="bg-[#252540] border-[#2a2a3d]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Usage & Capacity</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Wired</span>
              </div>
              <div className="text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Wireless</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row - Device & Client Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Device Status */}
        <Card className="bg-[#252540] border-[#2a2a3d]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Device Status</CardTitle>
              <span className="text-xs text-gray-500">Total Managed Devices: {stats.totalDevices}</span>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Wired</span>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Wireless</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Health */}
        <Card className="bg-[#252540] border-[#2a2a3d]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Client Health</CardTitle>
              <span className="text-xs text-gray-500">Total Clients: {stats.totalClients}</span>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <span className="text-2xl font-bold text-amber-500">{stats.clientIssues}</span>
                <span className="text-xs text-gray-400 block">Total Issues</span>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                <span className="text-xs text-gray-400">Wired</span>
              </div>
              <div className="text-center">
                {stats.wirelessClients > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-amber-500">{stats.wirelessClients}</span>
                    <span className="text-xs text-gray-400 block">Wireless</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
                    <span className="text-xs text-gray-400">Wireless</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-center mt-2 text-xs text-gray-500">Last 3 Days</div>
          </CardContent>
        </Card>

        {/* Device Health */}
        <Card className="bg-[#252540] border-[#2a2a3d]">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-400">Device Health</CardTitle>
              <span className="text-xs text-gray-500">Total Managed Devices: {stats.totalDevices}</span>
            </div>
          </CardHeader>
          <CardContent className="py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Wired</span>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <span className="text-sm text-gray-400">Wireless</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sites Section */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Sites</h2>
        
        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#252540] border-[#2a2a3d] text-white placeholder:text-gray-500"
          />
        </div>

        {/* Sites Table */}
        <div className="rounded-lg border border-[#2a2a3d] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a1a2e] border-b border-[#2a2a3d]">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Alerts</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Usage & Capacity Issues</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Device Health</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Device Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Client Health</th>
              </tr>
            </thead>
            <tbody className="bg-[#252540]">
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? 'No sites match your search' : 'No sites configured'}
                  </td>
                </tr>
              ) : (
                filteredSites.map((site) => (
                  <tr key={site.siteId} className="border-b border-[#2a2a3d] hover:bg-[#2a2a3d] transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{site.siteName}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusIcon hasIssues={(site.alerts || 0) > 0} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusIcon hasIssues={(site.usageCapacityIssues || 0) > 0} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusIcon hasIssues={site.deviceHealth !== 'good'} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusIcon hasIssues={site.deviceStatus !== 'online'} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <StatusIcon hasIssues={site.clientHealth !== 'good'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdate && (
        <div className="text-xs text-gray-500 text-right">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

export default DashboardExtreme;
