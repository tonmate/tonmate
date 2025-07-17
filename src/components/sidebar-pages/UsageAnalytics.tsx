'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, MessageSquare, Users, Clock, Zap, Database, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Alert } from '@/components/ui/Alert';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface UsageData {
  totalMessages: number;
  totalTokensUsed: number;
  totalAgents: number;
  totalKnowledgeSources: number;
  messagesThisMonth: number;
  tokensThisMonth: number;
  avgResponseTime: number;
  successRate: number;
}

interface DailyStats {
  date: string;
  messages: number;
  tokens: number;
  users: number;
}

interface AgentUsage {
  name: string;
  messages: number;
  tokens: number;
  successRate: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function UsageAnalytics() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [agentUsage, setAgentUsage] = useState<AgentUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchUsageData();
  }, [selectedPeriod]);

  const fetchUsageData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/usage?period=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsageData(data.overview);
      setDailyStats(data.dailyStats);
      setAgentUsage(data.agentUsage);
    } catch (err) {
      console.error('Error fetching usage data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch usage data');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (tokens: number) => {
    // Rough estimate: $0.002 per 1K tokens
    const cost = (tokens / 1000) * 0.002;
    return `$${cost.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading variant="spinner" size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Alert variant="danger" title="Error loading analytics">
          <p className="mb-4">{error}</p>
          <Button onClick={fetchUsageData} variant="primary" size="sm">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No usage data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
          <p className="text-gray-600 mt-1">Track your AI agent performance and usage</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select
              value={selectedPeriod}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
              options={[
                { value: '7d', label: 'Last 7 days' },
                { value: '30d', label: 'Last 30 days' },
                { value: '90d', label: 'Last 90 days' }
              ]}
              variant="outline"
              selectSize="sm"
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(usageData.totalMessages)}</p>
                <p className="text-xs text-green-600 mt-1">
                  +{formatNumber(usageData.messagesThisMonth)} this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tokens Used</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(usageData.totalTokensUsed)}</p>
                <p className="text-xs text-blue-600 mt-1">
                  ≈ {formatCurrency(usageData.totalTokensUsed)} cost
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{usageData.totalAgents}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {usageData.totalKnowledgeSources} knowledge sources
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{usageData.avgResponseTime}ms</p>
                <p className="text-xs text-green-600 mt-1">
                  {usageData.successRate}% success rate
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Period Comparison */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'}</div>
              <div className="text-sm text-gray-600">Days Period</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{usageData ? Math.round(usageData.messagesThisMonth / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90)) : 0}</div>
              <div className="text-sm text-gray-600">Avg Messages/Day</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{usageData ? Math.round(usageData.tokensThisMonth / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90)) : 0}</div>
              <div className="text-sm text-gray-600">Avg Tokens/Day</div>
            </div>
          </div>
        </div>

        {/* Usage Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Messages</span>
              <span className="font-semibold">{usageData ? formatNumber(usageData.messagesThisMonth) : 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Tokens</span>
              <span className="font-semibold">{usageData ? formatNumber(usageData.tokensThisMonth) : 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Estimated Cost</span>
              <span className="font-semibold">{usageData ? formatCurrency(usageData.tokensThisMonth) : '$0.00'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Average Response Time</span>
              <span className="font-semibold">{usageData ? usageData.avgResponseTime : 0}ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agentUsage.map((agent, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{formatNumber(agent.messages)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{formatNumber(agent.tokens)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${agent.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{agent.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-900">{formatCurrency(agent.tokens)}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
