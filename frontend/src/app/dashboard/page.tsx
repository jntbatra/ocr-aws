'use client';

import { useState, useEffect } from 'react';
import { getExpenses } from '@/lib/api';
import { formatMoney, getMonthString, getLastMonthString } from '@/lib/helpers';
import StatsCard from '@/components/StatsCard';
import ChartPie from '@/components/ChartPie';
import ChartLine from '@/components/ChartLine';
import Loader from '@/components/Loader';
import { DollarSign, TrendingUp, Calendar, Archive } from 'lucide-react';

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  if (loading) return <Loader />;

  // Calculate stats
  const currentMonth = getMonthString();
  const lastMonth = getLastMonthString();
  
  const thisMonthExpenses = expenses.filter(e => e.date?.startsWith(currentMonth));
  const lastMonthExpenses = expenses.filter(e => e.date?.startsWith(lastMonth));
  
  const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
  const yearTotal = expenses.reduce((sum, e) => sum + (e.total || 0), 0);

  // Category breakdown
  const categoryData = expenses.reduce((acc: any, exp) => {
    const cat = exp.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += exp.total || 0;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value: value as number,
  }));

  // Monthly trend (last 6 months)
  const monthlyTrend: { [key: string]: number } = {};
  expenses.forEach(exp => {
    const month = exp.date?.substring(0, 7);
    if (month) {
      monthlyTrend[month] = (monthlyTrend[month] || 0) + (exp.total || 0);
    }
  });

  const lineData = Object.entries(monthlyTrend)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([name, amount]) => ({ name, amount }));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of your spending habits</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="This Month"
          value={formatMoney(thisMonthTotal)}
          icon={Calendar}
          color="indigo"
        />
        <StatsCard
          title="Last Month"
          value={formatMoney(lastMonthTotal)}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Year to Date"
          value={formatMoney(yearTotal)}
          icon={Archive}
          color="green"
        />
        <StatsCard
          title="Total Expenses"
          value={expenses.length.toString()}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Spending by Category</h2>
          <ChartPie data={pieData} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Trend</h2>
          <ChartLine data={lineData} />
        </div>
      </div>
    </div>
  );
}
