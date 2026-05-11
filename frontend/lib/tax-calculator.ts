export interface SlabResult {
  regime: "old" | "new";
  gross_income: number;
  taxable_income: number;
  tax_liability: number;
  tds_paid: number;
  refund_or_payable: number;
  deductions_breakdown: {
    "80c": number;
    "80d": number;
    hra: number;
    standard: number;
  };
}

function calcOldRegime(income: number, deductions: { c80: number; d80: number; hra: number; standard: number }, tds: number): SlabResult {
  const totalDeductions = Math.min(deductions.c80, 150000) + Math.min(deductions.d80, 50000) + deductions.hra + deductions.standard;
  const taxable = Math.max(0, income - totalDeductions);

  let tax = 0;
  if (taxable > 1000000) tax += (taxable - 1000000) * 0.3;
  if (taxable > 500000) tax += (Math.min(taxable, 1000000) - 500000) * 0.2;
  if (taxable > 250000) tax += (Math.min(taxable, 500000) - 250000) * 0.05;

  const cess = tax * 0.04;
  const totalTax = Math.round(tax + cess);
  const refund = tds - totalTax;

  return {
    regime: "old",
    gross_income: income,
    taxable_income: taxable,
    tax_liability: totalTax,
    tds_paid: tds,
    refund_or_payable: refund,
    deductions_breakdown: {
      "80c": Math.min(deductions.c80, 150000),
      "80d": Math.min(deductions.d80, 50000),
      hra: deductions.hra,
      standard: deductions.standard,
    },
  };
}

function calcNewRegime(income: number, tds: number): SlabResult {
  const taxable = Math.max(0, income - 75000);
  let tax = 0;
  if (taxable > 1500000) tax += (taxable - 1500000) * 0.3;
  if (taxable > 1200000) tax += (Math.min(taxable, 1500000) - 1200000) * 0.2;
  if (taxable > 900000) tax += (Math.min(taxable, 1200000) - 900000) * 0.15;
  if (taxable > 600000) tax += (Math.min(taxable, 900000) - 600000) * 0.1;
  if (taxable > 300000) tax += (Math.min(taxable, 600000) - 300000) * 0.05;

  const cess = tax * 0.04;
  const totalTax = Math.round(tax + cess);
  return {
    regime: "new",
    gross_income: income,
    taxable_income: taxable,
    tax_liability: totalTax,
    tds_paid: tds,
    refund_or_payable: tds - totalTax,
    deductions_breakdown: { "80c": 0, "80d": 0, hra: 0, standard: 75000 },
  };
}

export function calculateTax(
  income: number,
  deductions: { c80: number; d80: number; hra: number; standard: number },
  tds: number,
  regime: "old" | "new" = "old"
): SlabResult {
  return regime === "old"
    ? calcOldRegime(income, deductions, tds)
    : calcNewRegime(income, tds);
}

export function formatINR(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-IN");
  return `₹${formatted}`;
}
