import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wifi,
  Users,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { mockApi } from '../services/mockData';
import type { DashboardSummary, ContextualInsight } from '../types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<ContextualInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, insightsData] = await Promise.all([
          mockApi.dashboard.getSummary(),
          mockApi.contextualInsights.getAll(),
        ]);
        setSummary(summaryData);
        setInsights(insightsData.filter(i => !i.dismissed).slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const getSeverityColor = (severity: ContextualInsight['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          <Activity className="w-4 h-4 mr-1" />
          Health: {summary?.health}%
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="bg-card border-0 shadow-lg cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => navigate('/connected-clients')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Connected Clients</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.activeClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {summary?.totalClients} total
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-card border-0 shadow-lg cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => navigate('/access-points')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Access Points</CardTitle>
            <Wifi className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.onlineAccessPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {summary?.totalAccessPoints} online
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bandwidth</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-green-500" />
                <span className="text-sm text-foreground">{formatBytes(summary?.totalBandwidth.upload || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-foreground">{formatBytes(summary?.totalBandwidth.download || 0)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Upload / Download</p>
          </CardContent>
        </Card>

        <Card
          className="bg-card border-0 shadow-lg cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => navigate('/contextual-insights')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{summary?.alerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground flex items-center justify-between">
              Recent Insights
              <button
                onClick={() => navigate('/contextual-insights')}
                className="text-sm text-primary hover:text-primary/80"
              >
                View All
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background transition-colors cursor-pointer"
                onClick={() => navigate('/contextual-insights')}
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(insight.severity)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{insight.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{insight.description}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {insight.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground flex items-center justify-between">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/connected-clients')}
              className="p-4 rounded-lg bg-background/50 hover:bg-background transition-colors text-left"
            >
              <Users className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">View Clients</p>
              <p className="text-xs text-muted-foreground">Monitor connected devices</p>
            </button>
            <button
              onClick={() => navigate('/access-points')}
              className="p-4 rounded-lg bg-background/50 hover:bg-background transition-colors text-left"
            >
              <Wifi className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Access Points</p>
              <p className="text-xs text-muted-foreground">Manage network APs</p>
            </button>
            <button
              onClick={() => navigate('/app-insights')}
              className="p-4 rounded-lg bg-background/50 hover:bg-background transition-colors text-left"
            >
              <Activity className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">App Insights</p>
              <p className="text-xs text-muted-foreground">Application analytics</p>
            </button>
            <button
              onClick={() => navigate('/contextual-insights')}
              className="p-4 rounded-lg bg-background/50 hover:bg-background transition-colors text-left"
            >
              <AlertTriangle className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground">Insights</p>
              <p className="text-xs text-muted-foreground">Alerts & recommendations</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
