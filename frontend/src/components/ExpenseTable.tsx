"use client";

import { useState } from "react";
import { formatMoney, formatDate } from "@/lib/helpers";
import { ExternalLink } from "lucide-react";

interface Expense {
  expenseId: string;
  merchant: string;
  date: string;
  total: number;
  category: string;
  receiptUrl: string;
}

interface ExpenseTableProps {
  expenses: Expense[];
}

export default function ExpenseTable({ expenses }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const categories = [...new Set(expenses.map((e) => e.category))];
  const months = [
    ...new Set(expenses.map((e) => e.date?.substring(0, 7) || "")),
  ]
    .sort()
    .reverse();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.merchant
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || expense.category === selectedCategory;
    const matchesMonth =
      !selectedMonth || expense.date?.startsWith(selectedMonth);
    return matchesSearch && matchesCategory && matchesMonth;
  });

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search merchant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        />
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
        >
          <option value="">All Months</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Merchant
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Receipt
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <tr
                key={expense.expenseId}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {expense.merchant}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                  {formatMoney(expense.total)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {expense.receiptUrl &&
                  typeof expense.receiptUrl === "string" &&
                  expense.receiptUrl.trim() ? (
                    <a
                      href={expense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.expenseId}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {expense.merchant}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatDate(expense.date)}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                {expense.category}
              </span>
            </div>
            <div className="flex justify-between items-center mt-3">
              <p className="text-xl font-bold text-gray-900">
                {formatMoney(expense.total)}
              </p>
              {expense.receiptUrl &&
              typeof expense.receiptUrl === "string" &&
              expense.receiptUrl.trim() ? (
                <a
                  href={expense.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm"
                >
                  View Receipt <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <p className="text-center text-gray-500 py-12">No expenses found</p>
      )}
    </div>
  );
}
