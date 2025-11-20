import Link from "next/link";
import { Upload, BarChart3, Receipt, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Expense Tracker with <span className="text-indigo-600">OCR</span>
        </h1>
        <p className="text-xl text-gray-600">
          Upload receipts or enter manually, track spending in ₹, and analyze
          your finances effortlessly.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan Receipt
          </h3>
          <p className="text-gray-600 text-sm">
            Upload receipt & extract data with OCR
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Add Manually
          </h3>
          <p className="text-gray-600 text-sm">
            Enter expense details manually in seconds
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI Extraction
          </h3>
          <p className="text-gray-600 text-sm">
            AWS Textract extracts merchant, date, & total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Track & Analyze
          </h3>
          <p className="text-gray-600 text-sm">
            View spending trends and monthly summaries
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link
          href="/upload"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md inline-flex items-center gap-2"
        >
          <Upload className="h-5 w-5" />
          Record Expense
        </Link>
        <Link
          href="/dashboard"
          className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-md border-2 border-indigo-600 inline-flex items-center gap-2"
        >
          <BarChart3 className="h-5 w-5" />
          View Dashboard
        </Link>
      </div>
    </div>
  );
}
