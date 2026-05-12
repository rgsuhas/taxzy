import { getToken, clearToken } from "./auth";
import type {
  LoginResponse,
  RegisterResponse,
  User,
  TaxProfile,
  TaxCalculation,
  Document,
  DocumentDetail,
  DocumentUploadResponse,
  MarketplaceOffer,
  RedeemResponse,
  RefundStatus,
  TaxUsage,
  GlossaryTerm,
  PANVerification,
  ConversationPreview,
  Conversation,
} from "@/types/api";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function loadMock<T>(path: string): Promise<T> {
  const mod = await import(`./mocks/${path}.json`);
  return mod.default as T;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (body && !isFormData) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }

  return res.json();
}

// Auth
export async function login(username: string, password: string): Promise<LoginResponse> {
  if (USE_MOCKS) return { access_token: "mock_token_12345", token_type: "bearer" };
  return request("POST", "/api/auth/login", { username, password });
}

export async function register(username: string, password: string): Promise<RegisterResponse> {
  if (USE_MOCKS) return { user_id: 1, username };
  return request("POST", "/api/auth/register", { username, password });
}

export async function logout(): Promise<void> {
  if (!USE_MOCKS) await request("POST", "/api/auth/logout");
  clearToken();
}

export async function getMe(): Promise<User> {
  if (USE_MOCKS) return { user_id: 1, username: "demo_user", created_at: new Date().toISOString() };
  return request("GET", "/api/auth/me");
}

// Tax Profile
export async function getProfile(): Promise<TaxProfile> {
  if (USE_MOCKS) return loadMock("tax-profile");
  return request("GET", "/api/tax-profile");
}

export async function updateProfile(field: string, value: unknown): Promise<TaxProfile> {
  if (USE_MOCKS) return loadMock("tax-profile");
  return request("PUT", "/api/tax-profile", { field, value });
}

export async function calculate(): Promise<TaxCalculation> {
  if (USE_MOCKS) return loadMock("tax-calculation");
  return request("POST", "/api/tax-profile/calculate");
}

// Documents
export async function uploadDocument(file: File, docType?: string): Promise<DocumentUploadResponse> {
  if (USE_MOCKS) {
    return {
      doc_id: 1,
      doc_type: docType || "form16",
      extracted_fields: { gross_income: 1200000, tds_paid: 85000, pan: "ABCDE1234F" },
      merged_into_profile: true,
    };
  }
  const fd = new FormData();
  fd.append("file", file);
  if (docType) fd.append("doc_type", docType);
  return request("POST", "/api/documents/upload", fd, true);
}

export async function getDocuments(): Promise<Document[]> {
  if (USE_MOCKS) {
    return [
      { doc_id: 1, doc_type: "form16", filename: "Form16_2024.pdf", uploaded_at: new Date().toISOString() },
    ];
  }
  return request("GET", "/api/documents");
}

export async function getDocument(docId: number): Promise<DocumentDetail> {
  return request("GET", `/api/documents/${docId}`);
}

export async function deleteDocument(docId: number): Promise<void> {
  return request("DELETE", `/api/documents/${docId}`);
}

// Marketplace
export async function getOffers(): Promise<MarketplaceOffer[]> {
  if (USE_MOCKS) return loadMock("marketplace-offers");
  return request("GET", "/api/marketplace/offers");
}

export async function redeemOffer(offerId: string): Promise<RedeemResponse> {
  if (USE_MOCKS) {
    return {
      voucher_code: "TAXZY-DEMO-1234",
      brand: "Amazon",
      amount: 31130,
      redeemed_at: new Date().toISOString(),
    };
  }
  return request("POST", "/api/marketplace/redeem", { offer_id: offerId });
}

// Refund tracker
export async function getRefundStatus(): Promise<RefundStatus> {
  if (USE_MOCKS) return loadMock("refund-status");
  return request("GET", "/api/refund/status");
}

// Tax usage
export async function getTaxUsage(taxPaid: number): Promise<TaxUsage> {
  if (USE_MOCKS) {
    return {
      breakdown: [
        { category: "Roads & infrastructure", percentage: 22, amount: taxPaid * 0.22, description: "National highways, rural roads" },
        { category: "Defence", percentage: 18, amount: taxPaid * 0.18, description: "Armed forces, border security" },
        { category: "Education", percentage: 15, amount: taxPaid * 0.15, description: "Schools, IITs, scholarships" },
        { category: "Healthcare", percentage: 12, amount: taxPaid * 0.12, description: "Hospitals, AIIMS, PMJAY" },
        { category: "Railways", percentage: 10, amount: taxPaid * 0.10, description: "Train network expansion" },
        { category: "Digital India", percentage: 8, amount: taxPaid * 0.08, description: "Broadband, e-governance" },
        { category: "Agriculture", percentage: 8, amount: taxPaid * 0.08, description: "Farmer subsidies, irrigation" },
        { category: "Other", percentage: 7, amount: taxPaid * 0.07, description: "Administration, debt servicing" },
      ],
      summary: `Your tax contribution is building India's future.`,
    };
  }
  return request("POST", "/api/tax-usage", { tax_paid: taxPaid });
}

// Glossary
export async function getGlossary(): Promise<GlossaryTerm[]> {
  if (USE_MOCKS) return loadMock("glossary");
  return request("GET", "/api/glossary");
}

export async function explainTerm(term: string): Promise<GlossaryTerm> {
  if (USE_MOCKS) {
    const glossary = await loadMock<GlossaryTerm[]>("glossary");
    return glossary.find((g) => g.term.toLowerCase() === term.toLowerCase()) || { term, definition: term, example: "" };
  }
  return request("POST", "/api/glossary/explain", { term });
}

// PAN
export async function verifyPAN(pan: string): Promise<PANVerification> {
  if (USE_MOCKS) {
    return { valid: true, full_name: "Rahul Sharma", dob: "1992-04-15", pan_type: "Individual", status: "Active" };
  }
  return request("POST", "/api/pan/verify", { pan });
}

// Chat history
export async function getChatHistory(): Promise<ConversationPreview[]> {
  if (USE_MOCKS) return [];
  return request("GET", "/api/chat/history");
}

export async function getConversation(id: number): Promise<Conversation> {
  return request("GET", `/api/chat/${id}`);
}

export async function deleteConversation(id: number): Promise<void> {
  return request("DELETE", `/api/chat/${id}`);
}

// ITR export
export async function generateITRXML(): Promise<Blob> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}/api/itr/generate-xml`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.blob();
}

// ITR JSON converter
export async function convertITRJson(file: File, targetFormat: string): Promise<{ blob: Blob; filename: string }> {
  const token = getToken();
  const fd = new FormData();
  fd.append("file", file);
  fd.append("target_format", targetFormat);

  const res = await fetch(`${BASE_URL}/api/itr/convert`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || res.statusText);
  }

  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename=(.+)/);
  const filename = match ? match[1] : `itr_data.${targetFormat}`;
  const blob = await res.blob();
  return { blob, filename };
}
