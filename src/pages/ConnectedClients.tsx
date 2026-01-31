import { useState, useEffect } from 'react';
import {
  Users,
  Wifi,
  Cable,
  Search,
  Signal,
  Laptop,
  Smartphone,
  Monitor,
  Printer,
  Tablet,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  X,
  Power
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
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
import type { ConnectedClient } from '../types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatConnectionTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
  if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
  return `${diffMins}m`;
}

function getDeviceIcon(deviceType?: string) {
  switch (deviceType?.toLowerCase()) {
    case 'laptop': return <Laptop className="h-4 w-4" />;
    case 'mobile': return <Smartphone className="h-4 w-4" />;
    case 'desktop': return <Monitor className="h-4 w-4" />;
    case 'tablet': return <Tablet className="h-4 w-4" />;
    case 'printer': return <Printer className="h-4 w-4" />;
    default: return <HelpCircle className="h-4 w-4" />;
  }
}

function getSignalStrengthColor(strength?: number): string {
  if (!strength) return 'text-muted-foreground';
  if (strength >= -50) return 'text-green-500';
  if (strength >= -60) return 'text-yellow-500';
  if (strength >= -70) return 'text-orange-500';
  return 'text-red-500';
}

function getSignalBars(strength?: number): number {
  if (!strength) return 0;
  if (strength >= -50) return 4;
  if (strength >= -60) return 3;
  if (strength >= -70) return 2;
  return 1;
}

export default function ConnectedClients() {
  const [clients, setClients] = useState<ConnectedClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<ConnectedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ConnectedClient | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockApi.clients.getAll();
        setClients(data);
        setFilteredClients(data);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = clients;

    if (searchQuery) {
      filtered = filtered.filter(
        (client) =>
          client.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.ipAddress.includes(searchQuery)
      );
    }

    if (connectionFilter !== 'all') {
      filtered = filtered.filter((client) => client.connectionType === connectionFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchQuery, connectionFilter, statusFilter]);

  const getStatusBadge = (status: ConnectedClient['status']) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-500 text-white">Online</Badge>;
      case 'offline': return <Badge className="bg-red-500 text-white">Offline</Badge>;
      default: return <Badge className="bg-yellow-500 text-black">Idle</Badge>;
    }
  };

  const onlineCount = clients.filter((c) => c.status === 'online').length;
  const wirelessCount = clients.filter((c) => c.connectionType === 'wireless').length;
  const wiredCount = clients.filter((c) => c.connectionType === 'wired').length;

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
          <h1 className="text-2xl font-medium text-foreground">Connected Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} total clients - {onlineCount} online
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold text-foreground">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
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
                <p className="text-sm text-muted-foreground">Wireless</p>
                <p className="text-2xl font-bold text-foreground">{wirelessCount}</p>
              </div>
              <Wifi className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Wired</p>
                <p className="text-2xl font-bold text-foreground">{wiredCount}</p>
              </div>
              <Cable className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by hostname, MAC, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={connectionFilter} onValueChange={setConnectionFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <SelectValue placeholder="Connection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wireless">Wireless</SelectItem>
            <SelectItem value="wired">Wired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] bg-card border-border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clients Table */}
      <div className="flex-1 overflow-hidden flex gap-6">
        <Card className="flex-1 bg-card border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Device</TableHead>
                    <TableHead className="text-muted-foreground">IP Address</TableHead>
                    <TableHead className="text-muted-foreground">Connection</TableHead>
                    <TableHead className="text-muted-foreground">Signal</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Data Usage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className={`border-b border-border/50 cursor-pointer hover:bg-background/50 transition-colors ${
                        selectedClient?.id === client.id ? 'bg-background/80' : ''
                      }`}
                      onClick={() => setSelectedClient(client)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background/50 text-primary">
                            {getDeviceIcon(client.deviceType)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.hostname}</p>
                            <p className="text-xs text-muted-foreground">{client.macAddress}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{client.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {client.connectionType === 'wireless' ? (
                            <Wifi className="h-4 w-4 text-primary" />
                          ) : (
                            <Cable className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm capitalize text-foreground">{client.connectionType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.connectionType === 'wireless' && client.signalStrength ? (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4].map((bar) => (
                              <div
                                key={bar}
                                className={`w-1 rounded-full ${
                                  bar <= getSignalBars(client.signalStrength)
                                    ? getSignalStrengthColor(client.signalStrength)
                                    : 'bg-muted'
                                }`}
                                style={{ height: `${bar * 4}px` }}
                              />
                            ))}
                            <span className="text-xs text-muted-foreground ml-1">
                              {client.signalStrength} dBm
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2 text-sm">
                          <span className="text-green-500 flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            {formatBytes(client.dataUsage.upload)}
                          </span>
                          <span className="text-blue-500 flex items-center gap-1">
                            <ArrowDownRight className="h-3 w-3" />
                            {formatBytes(client.dataUsage.download)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedClient && (
          <Card className="w-80 bg-card border-0 shadow-lg overflow-y-auto shrink-0">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-background/50 text-primary">
                  {getDeviceIcon(selectedClient.deviceType)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClient(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg mt-2">{selectedClient.hostname}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(selectedClient.status)}
                {selectedClient.deviceType && (
                  <Badge variant="outline">{selectedClient.deviceType}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Network Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">IP Address</span>
                    <span className="text-sm text-foreground">{selectedClient.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">MAC Address</span>
                    <span className="text-sm text-foreground font-mono text-xs">{selectedClient.macAddress}</span>
                  </div>
                  {selectedClient.connectionType === 'wireless' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">SSID</span>
                        <span className="text-sm text-foreground">{selectedClient.ssid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Access Point</span>
                        <span className="text-sm text-foreground">{selectedClient.accessPointName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Signal</span>
                        <span className={`text-sm ${getSignalStrengthColor(selectedClient.signalStrength)}`}>
                          {selectedClient.signalStrength} dBm
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Device Info</h4>
                <div className="space-y-2">
                  {selectedClient.os && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">OS</span>
                      <span className="text-sm text-foreground">{selectedClient.os}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connection Type</span>
                    <span className="text-sm text-foreground capitalize">{selectedClient.connectionType}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Session</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Connected
                    </span>
                    <span className="text-sm text-foreground">
                      {formatConnectionTime(selectedClient.connectionTime)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Data Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      Upload
                    </span>
                    <span className="text-sm text-foreground">{formatBytes(selectedClient.dataUsage.upload)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3 text-blue-500" />
                      Download
                    </span>
                    <span className="text-sm text-foreground">{formatBytes(selectedClient.dataUsage.download)}</span>
                  </div>
                </div>
              </div>

              {selectedClient.status === 'online' && (
                <Button
                  variant="destructive"
                  className="w-full mt-4"
                  onClick={() => console.log('Disconnect client:', selectedClient.id)}
                >
                  <Power className="h-4 w-4 mr-2" />
                  Disconnect Client
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
