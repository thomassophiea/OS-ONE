import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Lightbulb,
  X,
  ChevronRight,
  Filter,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { mockApi } from '../services/mockData';
import type { ContextualInsight } from '../types';

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function ContextualInsights() {
  const [insights, setInsights] = useState<ContextualInsight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<ContextualInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedInsight, setSelectedInsight] = useState<ContextualInsight | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await mockApi.contextualInsights.getAll();
        setInsights(data);
        setFilteredInsights(data);
      } catch (error) {
        console.error('Failed to fetch insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = insights;
    if (typeFilter !== 'all') {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }
    if (severityFilter !== 'all') {
      filtered = filtered.filter((i) => i.severity === severityFilter);
    }
    setFilteredInsights(filtered);
  }, [insights, typeFilter, severityFilter]);

  const getTypeIcon = (type: ContextualInsight['type']) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5" />;
      case 'warning': return <AlertCircle className="h-5 w-5" />;
      case 'recommendation': return <Lightbulb className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: ContextualInsight['type']) => {
    switch (type) {
      case 'alert': return 'text-red-500 bg-red-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'recommendation': return 'text-primary bg-primary/10';
      default: return 'text-blue-500 bg-blue-500/10';
    }
  };

  const getSeverityBadge = (severity: ContextualInsight['severity']) => {
    switch (severity) {
      case 'critical': return <Badge className="bg-red-500 text-white">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500 text-white">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500 text-black">Medium</Badge>;
      default: return <Badge className="bg-blue-500 text-white">Low</Badge>;
    }
  };

  const handleDismiss = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
    if (selectedInsight?.id === id) {
      setSelectedInsight(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const criticalCount = insights.filter((i) => i.severity === 'critical').length;
  const highCount = insights.filter((i) => i.severity === 'high').length;

  return (
    <div className="p-6 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Contextual Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {insights.length} insights - {criticalCount} critical, {highCount} high priority
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter by:</span>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="alert">Alerts</SelectItem>
            <SelectItem value="warning">Warnings</SelectItem>
            <SelectItem value="recommendation">Recommendations</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[140px] bg-card border-border">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Insights List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {filteredInsights.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No insights found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <Card
                key={insight.id}
                className={`bg-card border-0 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                  selectedInsight?.id === insight.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedInsight(insight)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(insight.type)}`}>
                      {getTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-foreground truncate">{insight.title}</h3>
                        {getSeverityBadge(insight.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(insight.timestamp)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {insight.category}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss(insight.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selectedInsight && (
          <Card className="w-96 bg-card border-0 shadow-lg overflow-y-auto shrink-0">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${getTypeColor(selectedInsight.type)}`}>
                  {getTypeIcon(selectedInsight.type)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInsight(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg mt-2">{selectedInsight.title}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getSeverityBadge(selectedInsight.severity)}
                <Badge variant="outline">{selectedInsight.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedInsight.description}</p>
              </div>

              {selectedInsight.relatedEntity && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Related Entity</h4>
                  <div className="p-3 rounded-lg bg-background/50">
                    <p className="text-sm text-foreground">{selectedInsight.relatedEntity.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedInsight.relatedEntity.type}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Timestamp</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedInsight.timestamp).toLocaleString()}
                </p>
              </div>

              {selectedInsight.actions && selectedInsight.actions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Actions</h4>
                  <div className="space-y-2">
                    {selectedInsight.actions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => console.log('Action:', action.action)}
                      >
                        {action.label}
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={() => handleDismiss(selectedInsight.id)}
              >
                Dismiss Insight
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
