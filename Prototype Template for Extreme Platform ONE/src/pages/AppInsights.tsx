import { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  AlertTriangle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
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
import type { AppInsight } from '../types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function AppInsights() {
  const [apps, setApps] = useState<AppInsight[]>([]);
  const [filteredApps, setFilteredApps] = useState<AppInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<AppInsight | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockApi.appInsights.getAll();
        setApps(data);
        setFilteredApps(data);
      } catch (error) {
        console.error('Failed to fetch app insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = apps;

    if (searchQuery) {
      filtered = filtered.filter((app) =>
        app.appName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((app) => app.category === categoryFilter);
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter((app) => app.riskLevel === riskFilter);
    }

    setFilteredApps(filtered);
  }, [apps, searchQuery, categoryFilter, riskFilter]);

  const getTrendIcon = (trend: AppInsight['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRiskBadge = (risk: AppInsight['riskLevel']) => {
    switch (risk) {
      case 'high': return <Badge className="bg-red-500 text-white">High Risk</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      default: return <Badge className="bg-green-500 text-white">Low</Badge>;
    }
  };

  const categories = [...new Set(apps.map((app) => app.category))];
  const totalBandwidth = apps.reduce(
    (acc, app) => ({
      upload: acc.upload + app.bandwidth.upload,
      download: acc.download + app.bandwidth.download,
    }),
    { upload: 0, download: 0 }
  );
  const highRiskApps = apps.filter((app) => app.riskLevel === 'high').length;

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
          <h1 className="text-2xl font-medium text-foreground">App Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor application usage and bandwidth consumption
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Apps</p>
                <p className="text-2xl font-bold text-foreground">{apps.length}</p>
              </div>
              <Activity className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upload</p>
                <p className="text-2xl font-bold text-foreground">{formatBytes(totalBandwidth.upload)}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Download</p>
                <p className="text-2xl font-bold text-foreground">{formatBytes(totalBandwidth.download)}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk Apps</p>
                <p className="text-2xl font-bold text-foreground">{highRiskApps}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px] bg-card border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <SelectValue placeholder="Risk Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk Levels</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium Risk</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <div className="flex-1 overflow-hidden flex gap-6">
        <Card className="flex-1 bg-card border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0 h-full">
            <div className="overflow-auto h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Application</TableHead>
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground text-right">Active Users</TableHead>
                    <TableHead className="text-muted-foreground text-right">Total Usage</TableHead>
                    <TableHead className="text-muted-foreground">Trend</TableHead>
                    <TableHead className="text-muted-foreground">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map((app) => (
                    <TableRow
                      key={app.id}
                      className={`border-b border-border/50 cursor-pointer hover:bg-background/50 transition-colors ${
                        selectedApp?.id === app.id ? 'bg-background/80' : ''
                      }`}
                      onClick={() => setSelectedApp(app)}
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          {app.appName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {app.activeUsers}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-foreground">
                        {formatBytes(app.totalUsage)}
                      </TableCell>
                      <TableCell>{getTrendIcon(app.trend)}</TableCell>
                      <TableCell>{getRiskBadge(app.riskLevel)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Panel */}
        {selectedApp && (
          <Card className="w-80 bg-card border-0 shadow-lg overflow-y-auto shrink-0">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {selectedApp.appName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{selectedApp.category}</Badge>
                {getRiskBadge(selectedApp.riskLevel)}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Usage Statistics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Active Users</span>
                      <span className="text-foreground">{selectedApp.activeUsers}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Total Usage</span>
                      <span className="text-foreground">{formatBytes(selectedApp.totalUsage)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Bandwidth</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3 text-green-500" />
                        Upload
                      </span>
                      <span className="text-foreground">{formatBytes(selectedApp.bandwidth.upload)}</span>
                    </div>
                    <Progress
                      value={(selectedApp.bandwidth.upload / selectedApp.totalUsage) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <ArrowDownRight className="h-3 w-3 text-blue-500" />
                        Download
                      </span>
                      <span className="text-foreground">{formatBytes(selectedApp.bandwidth.download)}</span>
                    </div>
                    <Progress
                      value={(selectedApp.bandwidth.download / selectedApp.totalUsage) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Top Users</h4>
                <div className="space-y-2">
                  {selectedApp.topUsers.map((user, index) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-2 rounded-lg bg-background/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <span className="text-sm text-foreground">{user.username}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatBytes(user.usage)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Trend</h4>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/50">
                  {getTrendIcon(selectedApp.trend)}
                  <span className="text-sm text-foreground capitalize">{selectedApp.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
