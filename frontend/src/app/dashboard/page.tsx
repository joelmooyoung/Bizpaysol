'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { DataPrefetcher, BackgroundRefresh } from '@/components/DataOptimization';
import { 
  BanknotesIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { useTransactionStats, useNACHAFiles } from '@/hooks';

interface StatCard {
  name: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  // Using optimized React Query hooks
  const { data: transactionStats, isLoading: statsLoading, error: statsError } = useTransactionStats();
  const { data: nachaFiles, isLoading: filesLoading } = useNACHAFiles({ page: 1, limit: 10 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const stats: StatCard[] = [
    {
      name: 'Total Transactions',
      value: transactionStats ? formatNumber(transactionStats.totalTransactions) : '0',
      icon: BanknotesIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Pending Transactions',
      value: transactionStats ? formatNumber(transactionStats.pendingTransactions) : '0',
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Processed Transactions',
      value: transactionStats ? formatNumber(transactionStats.processedTransactions) : '0',
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Failed Transactions',
      value: transactionStats ? formatNumber(transactionStats.failedTransactions) : '0',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
    {
      name: 'Total Amount',
      value: transactionStats ? formatCurrency(transactionStats.totalAmount) : '$0.00',
      icon: ArrowTrendingUpIcon,
      color: 'bg-indigo-500',
    },
    {
      name: 'NACHA Files Generated',
      value: nachaFiles ? formatNumber(nachaFiles.length) : '0',
      icon: DocumentTextIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <DashboardLayout>
      <DataPrefetcher>
        <BackgroundRefresh />
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name}! Here&apos;s an overview of your ACH processing system.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
              >
                <dt>
                  <div className={`absolute rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
                </dt>
                <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading || filesLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                    ) : (
                      stat.value
                    )}
                  </p>
                  {stat.change && (
                    <p
                      className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : stat.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {stat.change}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  onClick={() => router.push('/dashboard/transactions/new')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  New Transaction
                </button>
                <button
                  onClick={() => router.push('/dashboard/nacha')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate NACHA
                </button>
                <button
                  onClick={() => router.push('/dashboard/reports')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Reports
                </button>
                <button
                  onClick={() => router.push('/dashboard/transactions')}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View All Transactions
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">System Status</h3>
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">ACH Processing System</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Operational</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Database Connection</span>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">SFTP Connection</span>
                  </div>
                  <span className="text-sm text-yellow-600 font-medium">Not Configured</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* React Query Performance Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">React Query Optimization Status</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div>• Statistics: {statsLoading ? 'Loading...' : statsError ? 'Error' : 'Cached'}</div>
                <div>• NACHA Files: {filesLoading ? 'Loading...' : 'Cached'}</div>
                <div>• Background refresh: Active</div>
                <div>• Data prefetching: Enabled</div>
              </div>
            </div>
          )}
        </div>
      </DataPrefetcher>
    </DashboardLayout>
  );
}