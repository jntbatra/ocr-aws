"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import {
  getUploadUrl,
  uploadToS3,
  processReceipt,
  getExpenses,
} from "@/lib/api";
import Loader from "./Loader";

interface ExtractedData {
  merchant: string;
  date: string;
  total: number;
  category: string;
}

export default function UploadBox() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(
    null
  );
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "Food",
    "Transportation",
    "Entertainment",
    "Utilities",
    "Shopping",
    "Healthcare",
    "Education",
    "General",
  ];

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setError("");
      setExtractedData(null);
    } else {
      setError("Please select a valid image file");
    }
  };

  const pollForExpense = async (
    startTime: number
  ): Promise<ExtractedData | null> => {
    const maxAttempts = 20;
    const pollInterval = 3000; // 3 seconds

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));

      try {
        const expenses = await getExpenses();
        // Find the most recent expense created after upload
        const recentExpense = expenses.find((exp: any) => {
          const createdAt = new Date(exp.createdAt).getTime();
          return createdAt > startTime;
        });

        if (recentExpense) {
          return {
            merchant: recentExpense.merchant || "Unknown",
            date: recentExpense.date || "",
            total: recentExpense.total || 0,
            category: recentExpense.category || "General",
          };
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }
    return null;
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      // Get signed URL
      const { uploadUrl, key } = await getUploadUrl(file.type);

      // Upload to S3
      await uploadToS3(uploadUrl, file);

      // Process the receipt - returns extracted data
      const processResult = await processReceipt(key);

      // Set extracted data for review before saving
      if (processResult.extracted) {
        const data = {
          merchant: processResult.extracted.merchant || "Unknown",
          date: processResult.extracted.date || "",
          total: processResult.extracted.total || 0,
          category: processResult.extracted.category || "General",
        };
        setExtractedData(data);
        setEditedData(data);
        setReceiptUrl(processResult.receiptUrl || "");
      }

      setUploading(false);
      setProcessing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!editedData) return;

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/save-expense`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            receiptUrl,
            merchant: editedData.merchant,
            total: editedData.total,
            date: editedData.date,
            category: editedData.category,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save expense");
      }

      const result = await response.json();
      setError("");
      setExtractedData(null);
      setEditedData(null);
      setFile(null);
      setReceiptUrl("");

      // Show success message
      alert("Expense saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const handleEditChange = (field: keyof ExtractedData, value: any) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: field === "total" ? parseFloat(value) : value,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className="border-2 border-dashed border-indigo-300 rounded-xl p-12 text-center bg-gradient-to-br from-indigo-50 to-purple-50 hover:border-indigo-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFileChange(e.dataTransfer.files[0]);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
        <Upload className="h-16 w-16 mx-auto text-indigo-600 mb-4" />
        <p className="text-xl font-semibold text-gray-700 mb-2">
          {file ? file.name : "Drop receipt image here or click to browse"}
        </p>
        <p className="text-sm text-gray-500">Supports: JPG, PNG</p>
      </div>

      {file && !uploading && !processing && !extractedData && (
        <button
          onClick={handleUpload}
          className="mt-6 w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Upload & Process
        </button>
      )}

      {uploading && <Loader text="Uploading to S3..." />}
      {processing && <Loader text="Processing receipt with OCR..." />}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {extractedData && editedData && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6 text-blue-700">
            <CheckCircle className="h-6 w-6" />
            <h3 className="text-xl font-bold">
              OCR Extraction Complete - Review & Edit
            </h3>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Merchant
              </label>
              <input
                type="text"
                value={editedData.merchant}
                onChange={(e) => handleEditChange("merchant", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={editedData.total}
                    onChange={(e) => handleEditChange("total", e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editedData.date}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={editedData.category}
                  onChange={(e) => handleEditChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveExpense}
              disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Expense"}
            </button>
            <button
              onClick={() => {
                setExtractedData(null);
                setEditedData(null);
                setFile(null);
                setReceiptUrl("");
              }}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
