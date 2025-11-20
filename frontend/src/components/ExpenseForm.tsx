"use client";

import { useState } from "react";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import Loader from "./Loader";

interface FormData {
  amount: string;
  merchant: string;
  category: string;
  description: string;
  date: string;
}

export default function ExpenseForm({
  onExpenseAdded,
}: {
  onExpenseAdded?: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    merchant: "",
    category: "Food",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Healthcare",
    "Education",
    "Other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!formData.merchant.trim()) {
      setError("Please enter a merchant/vendor name");
      return;
    }

    if (!formData.date) {
      setError("Please select a date");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseFloat(formData.amount),
            merchant: formData.merchant,
            category: formData.category,
            description: formData.description,
            date: formData.date,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create expense");
      }

      await response.json();
      setSuccess(true);
      setFormData({
        amount: "",
        merchant: "",
        category: "Food",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });

      setTimeout(() => {
        setSuccess(false);
        if (onExpenseAdded) {
          onExpenseAdded();
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Creating expense..." />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Add New Expense
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Merchant */}
          <div>
            <label
              htmlFor="merchant"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Merchant / Vendor *
            </label>
            <input
              type="text"
              id="merchant"
              name="merchant"
              placeholder="e.g., McDonald's, Uber, Amazon"
              value={formData.merchant}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Add a note about this expense"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Expense created successfully!
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Expense
          </button>
        </form>
      </div>
    </div>
  );
}
