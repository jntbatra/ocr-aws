export const parseExpenseData = (textractResponse) => {
  const expenseDocuments = textractResponse.ExpenseDocuments || [];
  if (expenseDocuments.length === 0) {
    return null;
  }

  // We'll take the first document found
  const doc = expenseDocuments[0];
  const summaryFields = doc.SummaryFields || [];
  const lineItemGroups = doc.LineItemGroups || [];

  let total = 0;
  let date = null;
  let merchant = "Unknown";
  let rawText = "";

  // Extract Summary Fields
  summaryFields.forEach((field) => {
    const type = field.Type?.Text;
    const value = field.ValueDetection?.Text;

    if (type === "TOTAL") {
      // Clean up currency symbols
      const cleanTotal = value.replace(/[^0-9.]/g, "");
      total = parseFloat(cleanTotal) || 0;
    } else if (type === "INVOICE_RECEIPT_DATE" || type === "RECEIPT_DATE") {
      date = formatDate(value);
    } else if (type === "VENDOR_NAME") {
      merchant = value;
    }

    if (value) rawText += value + " ";
  });

  // Fallback: If no date found, use today
  if (!date) {
    date = new Date().toISOString().split("T")[0];
  }

  // Simple category detection based on merchant or keywords (Optional enhancement)
  const category = detectCategory(merchant, rawText);

  return {
    total,
    date,
    merchant,
    category,
    rawText: rawText.trim(),
  };
};

const formatDate = (dateString) => {
  if (!dateString) return new Date().toISOString().split("T")[0];

  console.log("Formatting date:", dateString);

  // Try to parse various date formats and convert to YYYY-MM-DD

  // Format: MM/DD/YYYY or M/D/YYYY
  const slashMatch = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const month = String(slashMatch[1]).padStart(2, "0");
    const day = String(slashMatch[2]).padStart(2, "0");
    const year = slashMatch[3];
    const formatted = `${year}-${month}-${day}`;
    console.log("Converted from slash format:", formatted);
    return formatted;
  }

  // Format: YYYY-MM-DD (already correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    console.log("Already in correct format:", dateString);
    return dateString;
  }

  // Format: Month DD, YYYY or DD Month YYYY
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 0; i < monthNames.length; i++) {
    const fullMonth = monthNames[i];
    const shortMonth = monthShort[i];

    // Try "November 21, 2025" format
    const fullMatch = dateString.match(
      new RegExp(`${fullMonth}\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i")
    );
    if (fullMatch) {
      const month = String(i + 1).padStart(2, "0");
      const day = String(fullMatch[1]).padStart(2, "0");
      const year = fullMatch[2];
      const formatted = `${year}-${month}-${day}`;
      console.log("Converted from full month format:", formatted);
      return formatted;
    }

    // Try "Nov 21, 2025" format
    const shortMatch = dateString.match(
      new RegExp(`${shortMonth}\\s+(\\d{1,2}),?\\s+(\\d{4})`, "i")
    );
    if (shortMatch) {
      const month = String(i + 1).padStart(2, "0");
      const day = String(shortMatch[1]).padStart(2, "0");
      const year = shortMatch[2];
      const formatted = `${year}-${month}-${day}`;
      console.log("Converted from short month format:", formatted);
      return formatted;
    }
  }

  // Fallback to today
  console.log("Could not parse date, using today");
  return new Date().toISOString().split("T")[0];
};

const detectCategory = (merchant, text) => {
  const lowerText = (merchant + " " + text).toLowerCase();

  if (
    lowerText.includes("restaurant") ||
    lowerText.includes("food") ||
    lowerText.includes("cafe") ||
    lowerText.includes("burger")
  )
    return "Food";
  if (
    lowerText.includes("uber") ||
    lowerText.includes("lyft") ||
    lowerText.includes("taxi") ||
    lowerText.includes("gas")
  )
    return "Transport";
  if (lowerText.includes("hotel") || lowerText.includes("airbnb"))
    return "Travel";
  if (lowerText.includes("market") || lowerText.includes("grocery"))
    return "Groceries";

  return "General";
};
