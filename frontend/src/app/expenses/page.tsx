'use client';

import { useState, useEffect } from 'react';
import { getExpenses } from '@/lib/api';
import ExpenseTable from '@/components/ExpenseTable';
import Loader from '@/components/Loader';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const data = await getExpenses();
        setExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p className="text-gray-600">View and filter all your tracked expenses</p>
      </div>

      {loading && <Loader />}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {!loading && !error && <ExpenseTable expenses={expenses} />}
    </div>
  );
}
