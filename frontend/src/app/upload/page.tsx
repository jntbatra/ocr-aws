"use client";

import { useState } from "react";
import { Upload, Plus } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import ExpenseForm from "@/components/ExpenseForm";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<"ocr" | "manual">("ocr");
  const router = useRouter();

  const handleExpenseAdded = () => {
    // Refresh the page to show the new expense
    router.refresh();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Add Expense</h1>
        <p className="text-gray-600">
          Choose between scanning a receipt or entering details manually
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "ocr"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Upload className="h-5 w-5" />
          Scan Receipt
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            activeTab === "manual"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          <Plus className="h-5 w-5" />
          Enter Manually
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "ocr" && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 text-sm">
              📸 Upload a receipt image and we'll automatically extract the
              merchant, amount, and date using OCR.
            </p>
          </div>
          <UploadBox />
        </div>
      )}

      {activeTab === "manual" && (
        <div>
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-900 text-sm">
              ✏️ Enter your expense details manually. Perfect for quick entries
              or when you don't have a receipt.
            </p>
          </div>
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />
        </div>
      )}
    </div>
  );
}
