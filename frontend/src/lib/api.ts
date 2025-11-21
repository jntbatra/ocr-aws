import { API_BASE_URL } from "./config";

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") {
    return {}; // SSR - no localStorage available
  }
  const token = localStorage.getItem("accessToken");
  console.log("Auth token:", token ? "Present" : "Missing");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const signup = async (
  email: string,
  password: string,
  username: string
) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  });
  if (!response.ok) throw new Error("Signup failed");
  return response.json();
};

export const confirmSignup = async (
  email: string,
  confirmationCode: string
) => {
  const response = await fetch(`${API_BASE_URL}/auth/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, confirmationCode }),
  });
  if (!response.ok) throw new Error("Confirmation failed");
  return response.json();
};

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Login failed");
  const data = await response.json();

  // Store tokens
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("idToken", data.idToken);

  return data;
};

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) throw new Error("Failed to send reset code");
  return response.json();
};

export const confirmForgotPassword = async (
  email: string,
  confirmationCode: string,
  newPassword: string
) => {
  const response = await fetch(`${API_BASE_URL}/auth/confirm-forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, confirmationCode, newPassword }),
  });
  if (!response.ok) throw new Error("Failed to reset password");
  return response.json();
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("idToken");
};

export const getUploadUrl = async (contentType: string = "image/jpeg") => {
  const response = await fetch(`${API_BASE_URL}/upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ contentType }),
  });
  if (!response.ok) throw new Error("Failed to get upload URL");
  return response.json();
};

export const uploadToS3 = async (url: string, file: File) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) throw new Error("Failed to upload to S3");
};

export const processReceipt = async (key: string) => {
  const response = await fetch(`${API_BASE_URL}/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ key }),
  });
  if (!response.ok) throw new Error("Failed to process receipt");
  return response.json();
};

export const getExpenses = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    console.log("Fetching expenses with headers:", headers);
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch expenses: ${response.status}`, errorText);
      throw new Error(`Failed to fetch expenses: ${response.status}`);
    }
    const data = await response.json();
    return data.expenses || [];
  } catch (error) {
    console.error("getExpenses error:", error);
    throw error;
  }
};

export const getMonthlySummary = async (month: string) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    const response = await fetch(`${API_BASE_URL}/summary?month=${month}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch summary: ${response.status}`, errorText);
      throw new Error(`Failed to fetch summary: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("getMonthlySummary error:", error);
    throw error;
  }
};

export const triggerSummary = async () => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    const response = await fetch(`${API_BASE_URL}/trigger-summary`, {
      method: "POST",
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to trigger summary: ${response.status}`, errorText);
      throw new Error(`Failed to trigger summary: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("triggerSummary error:", error);
    throw error;
  }
};
