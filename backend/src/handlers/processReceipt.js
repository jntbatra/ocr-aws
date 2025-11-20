import { analyzeReceipt } from "../utils/textract.js";
import { parseExpenseData } from "../utils/parser.js";
import { saveExpense } from "../utils/dynamo.js";
import { createExpenseItem } from "../models/expenseModel.js";
import { successResponse, errorResponse } from "../utils/response.js";
import config from "../config.js";

const BUCKET_NAME = config.uploadBucket;

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const { key } = body;

    if (!key) {
      return errorResponse("Key is required", 400);
    }

    console.log(`Analyzing receipt: ${BUCKET_NAME}/${key}`);

    // 1. Call Textract
    const textractResponse = await analyzeReceipt(BUCKET_NAME, key);

    // 2. Parse Data
    const extractedData = parseExpenseData(textractResponse);

    if (!extractedData) {
      console.warn(`No expense data found for ${key}`);
      return errorResponse("No expense data found", 400);
    }

    console.log("Extracted Data:", extractedData);

    // Return extracted data without saving yet - let user confirm/modify
    return successResponse({
      message: "Receipt scanned successfully",
      extracted: extractedData,
      receiptUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
      note: "Review the extracted data above. Use the 'Save Expense' endpoint to save or modify before saving.",
    });
  } catch (error) {
    console.error("Error processing receipt:", error);
    return errorResponse("Internal Server Error");
  }
};
