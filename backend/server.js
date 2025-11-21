import express from "express";
import cors from "cors";
import config from "./src/config.js";

console.log("express and cors imported");
import { authenticateToken } from "./src/middleware/auth.js";
console.log("auth middleware imported");
import {
  signup,
  confirmSignup,
  login,
  forgotPassword,
  confirmForgotPassword,
} from "./src/handlers/auth.js";
import { handler as getUploadUrlHandler } from "./src/handlers/getUploadUrl.js";
import { handler as processReceiptHandler } from "./src/handlers/processReceipt.js";
import { handler as monthlySummaryTriggerHandler } from "./src/handlers/monthlySummaryTrigger.js";

const app = express();
const PORT = config.port;

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  console.log("Health check called");
  res.status(200).json({ status: "ok" });
});

// Auth routes (public)
app.post("/auth/signup", async (req, res) => {
  console.log("Signup endpoint called");
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await signup(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/auth/confirm", async (req, res) => {
  console.log("Confirm endpoint called");
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await confirmSignup(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Confirm error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/auth/login", async (req, res) => {
  console.log("Login endpoint called with body:", req.body);
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await login(event);
    console.log("Login result status:", result.statusCode);
    console.log("Login result body preview:", result.body.substring(0, 100));
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Forgot Password endpoints (public)
app.post("/auth/forgot-password", async (req, res) => {
  console.log("Forgot password endpoint called");
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await forgotPassword(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/auth/confirm-forgot-password", async (req, res) => {
  console.log("Confirm forgot password endpoint called");
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await confirmForgotPassword(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error("Confirm forgot password error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Protected routes
app.post("/upload-url", authenticateToken, async (req, res) => {
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await getUploadUrlHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/expenses", authenticateToken, async (req, res) => {
  try {
    console.log("Get expenses endpoint called for user:", req.user.id);
    const userId = req.user.id;
    const { getExpensesByUser } = await import("./src/utils/dynamo.js");
    const expenses = await getExpensesByUser(userId);
    console.log(
      `Retrieved ${expenses ? expenses.length : 0} expenses for user ${userId}`
    );
    res.status(200).json({ expenses: expenses || [] });
  } catch (error) {
    console.error("Get expenses error:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.post("/expenses", authenticateToken, async (req, res) => {
  console.log("Create expense endpoint called");
  try {
    const userId = req.user.id;
    const { amount, merchant, category, description, date } = req.body;

    if (!amount || !merchant || !category) {
      return res
        .status(400)
        .json({ error: "Amount, merchant, and category are required" });
    }

    const { v4: uuidv4 } = await import("uuid");
    const expense = {
      expenseId: uuidv4(),
      userId,
      total: parseFloat(amount),
      merchant,
      category,
      description: description || "",
      date: date || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      // Note: receiptUrl is NOT set for manual entries, so it will be undefined
    };

    const { saveExpense } = await import("./src/utils/dynamo.js");
    await saveExpense(expense);

    res.status(201).json({
      message: "Expense created successfully",
      expenseId: expense.expenseId,
    });
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/process", authenticateToken, async (req, res) => {
  try {
    const event = { body: JSON.stringify(req.body) };
    const result = await processReceiptHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/save-expense", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      receiptUrl,
      merchant,
      total,
      date,
      category,
      rawText,
      description,
    } = req.body;

    if (!merchant || !total || !date) {
      return res.status(400).json({
        error: "Missing required fields: merchant, total, date",
      });
    }

    const { v4: uuidv4 } = await import("uuid");
    const { createExpenseItem } = await import("./src/models/expenseModel.js");
    const { saveExpense } = await import("./src/utils/dynamo.js");

    const extractedData = {
      merchant,
      total: parseFloat(total),
      date,
      category: category || "General",
      rawText: rawText || "",
    };

    const expenseItem = createExpenseItem(userId, extractedData, receiptUrl);
    await saveExpense(expenseItem);

    res.status(201).json({
      message: "Expense saved successfully",
      expenseId: expenseItem.expenseId,
      expense: expenseItem,
    });
  } catch (error) {
    console.error("Save expense error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/summary", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        error: "Missing required query parameter: month (YYYY-MM)",
      });
    }

    const { getExpensesByUser } = await import("./src/utils/dynamo.js");
    const expenses = await getExpensesByUser(userId);

    // Filter by month
    const monthlyExpenses = expenses.filter(
      (exp) => exp.date && exp.date.startsWith(month)
    );

    const totalAmount = monthlyExpenses.reduce(
      (sum, exp) => sum + (exp.amount || 0),
      0
    );

    const categoryBreakdown = monthlyExpenses.reduce((acc, exp) => {
      const cat = exp.category || "Uncategorized";
      acc[cat] = (acc[cat] || 0) + (exp.amount || 0);
      return acc;
    }, {});

    res.status(200).json({
      month,
      totalAmount,
      count: monthlyExpenses.length,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/trigger-summary", authenticateToken, async (req, res) => {
  try {
    const event = {};
    const result = await monthlySummaryTriggerHandler(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const server = app
  .listen(PORT, () => {
    console.log(`Server successfully listening on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });

// Error handling
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
