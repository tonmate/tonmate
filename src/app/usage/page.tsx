'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClockIcon, 
  BoltIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface UsageStats {
  totalTokens: number;
  totalCost: number;
  requestsToday: number;
  requestsThisMonth: number;
  averageResponseTime: number;
  dailyUsage: Array<{
    date: string;
    tokens: number;
    requests: number;
    cost: number;
  }>;
}

export default function Usage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsageStats();
    }
  }, [session, timeRange]);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(`/api/usage?period=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout title="Usage & Analytics" description="Monitor your AI usage and costs">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Usage & Analytics" description="Monitor your AI usage and costs">
      <div className="p-6">
        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <div className="flex rounded-md shadow-sm">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-4 py-2 text-sm font-medium ${
                    timeRange === period
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } ${
                    period === '7d' ? 'rounded-l-md' : 
                    period === '90d' ? 'rounded-r-md' : ''
                  } border border-gray-300`}
                >
                  {period === '7d' ? 'Last 7 days' : 
                   period === '30d' ? 'Last 30 days' : 
                   'Last 90 days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BoltIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tokens</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatNumber(stats.totalTokens) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatCurrency(stats.totalCost) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Requests Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? formatNumber(stats.requestsToday) : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats ? `${stats.averageResponseTime}ms` : '0ms'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Daily Usage</h3>
          </div>
          <div className="p-6">
            {stats?.dailyUsage && stats.dailyUsage.length > 0 ? (
              <div className="space-y-4">
                {stats.dailyUsage.map((day) => (
                  <div key={day.date} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900 w-24">
                        {new Date(day.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{formatNumber(day.tokens)}</span> tokens
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{formatNumber(day.requests)}</span> requests
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{formatCurrency(day.cost)}</span> cost
                        </div>
                      </div>
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (day.tokens / Math.max(...stats.dailyUsage.map(d => d.tokens))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No usage data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
