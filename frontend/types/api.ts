export interface User {
  user_id: number;
  username: string;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterResponse {
  user_id: number;
  username: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Conversation {
  conversation_id: number;
  messages: Message[];
}

export interface ConversationPreview {
  conversation_id: number;
  created_at: string;
  preview: string;
}

export interface Deductions {
  c80: number;
  d80: number;
  hra: number;
  standard: number;
}

export interface OtherIncome {
  interest: number;
  dividends: number;
  capital_gains: number;
}

export interface TaxProfile {
  pan: string | null;
  pan_verified: boolean;
  full_name: string | null;
  dob: string | null;
  filing_type: string | null;
  ay: string | null;
  gross_income: number | null;
  tds_paid: number | null;
  other_income: OtherIncome | null;
  deductions: Deductions | null;
  regime: string | null;
}

export interface DeductionsBreakdown {
  "80c": number;
  "80d": number;
  hra: number;
  standard: number;
}

export interface TaxCalculation {
  regime: string;
  gross_income: number;
  taxable_income: number;
  tax_liability: number;
  tds_paid: number;
  refund_or_payable: number;
  deductions_breakdown: DeductionsBreakdown;
}

export interface Document {
  doc_id: number;
  doc_type: string;
  filename: string;
  uploaded_at: string;
}

export interface DocumentDetail {
  doc_id: number;
  doc_type: string;
  parsed_data: Record<string, unknown>;
  uploaded_at: string;
}

export interface DocumentUploadResponse {
  doc_id: number;
  doc_type: string;
  extracted_fields: Record<string, unknown>;
  merged_into_profile: boolean;
}

export interface MarketplaceOffer {
  offer_id: string;
  brand: string;
  logo_url: string;
  conversion_rate: number;
  delivery: string;
  min_refund: number;
  description: string;
}

export interface RedeemResponse {
  voucher_code: string;
  brand: string;
  amount: number;
  redeemed_at: string;
}

export interface RefundTimelineStep {
  step: number;
  label: string;
  date: string | null;
  done: boolean;
}

export interface RefundStatus {
  status: string;
  current_step: number;
  estimated_date: string | null;
  timeline: RefundTimelineStep[];
}

export interface TaxUsageItem {
  category: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface TaxUsage {
  breakdown: TaxUsageItem[];
  summary: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
}

export interface PANVerification {
  valid: boolean;
  full_name: string | null;
  dob: string | null;
  pan_type: string | null;
  status: string | null;
}

export interface StructuredUpdate {
  income?: number;
  tds?: number;
  deductions?: Partial<Deductions>;
  pan?: string;
}
