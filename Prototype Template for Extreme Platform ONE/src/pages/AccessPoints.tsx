import { useState, useEffect } from 'react';
import {
  Wifi,
  Search,
  Users,
  Signal,
  Clock,
  MapPin,
  RefreshCw,
  Settings,
  X,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { mockApi } from '../services/mockData';
import type { AccessPoint } from '../types';

function getUtilizationColor(utilization: number): string {
  if (utilization >= 80) return 'text-red-500';
  if (utilization >= 60) return 'text-yellow-500';
  return 'text-green-500';
}

function getUtilizationBgColor(utilization: number): string {
  if (utilization >= 80) return 'bg-red-500';
  if (utilization >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
}

export default function AccessPoints() {
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([]);
  const [filteredAccessPoints, setFilteredAccessPoints] = useState<AccessPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bandFilter, setBandFilter] = useState<string>('all');
  const [selectedAP, setSelectedAP] = useState<AccessPoint | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockApi.accessPoints.getAll();
        setAccessPoints(data);
        setFilteredAccessPoints(data);
      } catch (error) {
        console.error('Failed to fetch access points:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = accessPoints;

    if (searchQuery) {
      filtered = filtered.filter(
        (ap) =>
          ap.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ap.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ap.ipAddress.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((ap) => ap.status === statusFilter);
    }

    if (bandFilter !== 'all') {
      filtered = filtered.filter((ap) => ap.band === bandFilter);
    }

    setFilteredAccessPoints(filtered);
  }, [accessPoints, searchQuery, statusFilter, bandFilter]);

  const getStatusBadge = (status: AccessPoint['status']) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-500 text-white">Online</Badge>;
      case 'offline': return <Badge className="bg-red-500 text-white">Offline</Badge>;
      default: return <Badge className="bg-yellow-500 text-black">Warning</Badge>;
    }
  };

  const onlineCount = accessPoints.filter((ap) => ap.status === 'online').length;
  const offlineCount = accessPoints.filter((ap) => ap.status === 'offline').length;
  const warningCount = accessPoints.filter((ap) => ap.status === 'warning').length;
  const totalClients = accessPoints.reduce((sum, ap) => sum + ap.clients, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Access Points</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {accessPoints.length} access points - {totalClients} connected clients
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total APs</p>
                <p className="text-2xl font-bold text-foreground">{accessPoints.length}</p>
              </div>
              <Wifi className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-500">{onlineCount}</p>
              </div>
              <Signal className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-500">{warningCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
              </div>
              <Wifi className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, MAC, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bandFilter} onValueChange={setBandFilter}>
          <SelectTrigger className="w-[130px] bg-card border-border">
            <SelectValue placeholder="Band" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bands</SelectItem>
            <SelectItem value="2.4GHz">2.4 GHz</SelectItem>
            <SelectItem value="5GHz">5 GHz</SelectItem>
            <SelectItem value="6GHz">6 GHz</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Access Points Table */}
      <div className="flex-1 overflow-hidden flex gap-6">
        <Card className="flex-1 bg-card border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Access Point</TableHead>
                    <TableHead className="text-muted-foreground">IP Address</TableHead>
                    <TableHead className="text-muted-foreground">Band / Channel</TableHead>
                    <TableHead className="text-muted-foreground text-center">Clients</TableHead>
                    <TableHead className="text-muted-foreground">Utilization</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccessPoints.map((ap) => (
                    <TableRow
                      key={ap.id}
                      className={`border-b border-border/50 cursor-pointer hover:bg-background/50 transition-colors ${
                        selectedAP?.id === ap.id ? 'bg-background/80' : ''
                      }`}
                      onClick={() => setSelectedAP(ap)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            ap.status === 'online' ? 'bg-green-500/10 text-green-500' :
                            ap.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            <Wifi className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{ap.name}</p>
                            <p className="text-xs text-muted-foreground">{ap.model}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{ap.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ap.band}</Badge>
                          <span className="text-sm text-muted-foreground">Ch {ap.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{ap.clients}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={getUtilizationColor(ap.utilization)}>{ap.utilization}%</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getUtilizationBgColor(ap.utilization)} transition-all`}
                              style={{ width: `${ap.utilization}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ap.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedAP && (
          <Card className="w-80 bg-card border-0 shadow-lg overflow-y-auto shrink-0">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${
                  selectedAP.status === 'online' ? 'bg-green-500/10 text-green-500' :
                  selectedAP.status === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  <Wifi className="h-5 w-5" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAP(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg mt-2">{selectedAP.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(selectedAP.status)}
                <Badge variant="outline">{selectedAP.model}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Network Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IP Address</span>
                    <span className="text-sm text-foreground">{selectedAP.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">MAC Address</span>
                    <span className="text-sm text-foreground font-mono text-xs">{selectedAP.macAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Band</span>
                    <span className="text-sm text-foreground">{selectedAP.band}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <span className="text-sm text-foreground">{selectedAP.channel}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Performance</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Utilization</span>
                      <span className={getUtilizationColor(selectedAP.utilization)}>
                        {selectedAP.utilization}%
                      </span>
                    </div>
                    <Progress
                      value={selectedAP.utilization}
                      className="h-2"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Connected Clients
                    </span>
                    <span className="text-sm text-foreground">{selectedAP.clients}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Device Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Serial Number</span>
                    <span className="text-sm text-foreground font-mono text-xs">{selectedAP.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Firmware</span>
                    <span className="text-sm text-foreground">{selectedAP.firmware}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Uptime
                    </span>
                    <span className="text-sm text-foreground">{selectedAP.uptime}</span>
                  </div>
                </div>
              </div>

              {selectedAP.location && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Location</h4>
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm text-foreground">{selectedAP.location}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {selectedAP.status !== 'offline' && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => console.log('Reboot AP:', selectedAP.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reboot
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => console.log('Configure AP:', selectedAP.id)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
